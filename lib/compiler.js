define(function(require, exports, module) {
  "use strict";

  // Borrowed from Underscore.js template function.
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // Borrowed from Underscore.js template function.
  var escapes = {
    "'": "'",
    "\\": "\\",
    "\r": "r",
    "\n": "n",
    "\t": "t",
    "\u2028": "u2028",
    "\u2029": "u2029"
  };

  function escapeValue(value) {
    return value.replace(escaper, function(match) {
      return "\\" + escapes[match];
    });
  }

  function normalizeIdentifier(identifier) {
    return "data" + identifier.split(".").map(function(property) {
      return "['" + property + "']";
    }).join("");
  }

  /**
   * FIXME Will need to be recursive.
   *
   */
  function Compiler(tree) {
    this.tree = tree;
    this.string = "";
    this.commands = [];

    var compiledSource = this.process(this.tree.body);

    // If there is a function, concatenate it to the default empty value.
    if (compiledSource) {
      compiledSource = " + " + compiledSource;
    }

    // The compiled function body.
    var body = "return ''" + compiledSource + ";";

    // Create the JavaScript function from the source code.
    this.func = new Function("data", "partials", "filters", body);

    // toString the function to get its raw source and expose.
    this.source = this.func.toString();
  }

  Compiler.prototype.process = function(body) {
    var commands = [];

    // Parse the tree and compile to JavaScript.
    body.forEach(function(entry) {
      if (entry.type === "Property") {
        commands.push(this.compileProperty(entry));
      }

      if (entry.type === "Text") {
        commands.push("'" + escapeValue(entry.value) + "'");
      }

      if (entry.type === "ConditionalExpression") {
        commands.push(this.compileConditional(entry));
      }

      if (entry.type === "PartialExpression") {
        commands.push(this.compilePartial(entry));
      }
    }, this);

    return commands.join("+");
  };

  Compiler.prototype.compileProperty = function(entry) {
    var identifier = normalizeIdentifier(entry.value);

    return [
      // If the identifier is a function, invoke.
      "(", "typeof", identifier, "===", "'function'", "?", identifier + "()",

      // Otherwise ensure it's a real value or set as empty string.
      ":", identifier, "||", "''", ")"
    ].join(" ");
  };

  Compiler.prototype.compileConditional = function(entry) {
    if (entry.conditions.length === 0) {
      throw new Error("Missing conditions to if statement.");
    }

    var condition = entry.conditions.map(function(condition) {
      switch (condition.type) {
        case "Identifier": {
          return normalizeIdentifier(condition.value);
        }

        case "Not": {
          return "!";
        }

        case "Literal": {
          return condition.value;
        }

        case "Equality": {
          return condition.value;
        }
      }
    }).join(" ");

    return [
      "(", "(", condition, ") ?", this.process(entry.body), ":", "''", ")"
    ].join(" ");
  };

  Compiler.prototype.compilePartial = function(entry) {
    return [
      "(",
        "partials['" + entry.value + "'].render(",
          entry.args.length ? normalizeIdentifier(entry.args[0]) : "null",
        ")",
      ")"
    ].join(" ");
  };

  module.exports = Compiler;
});
