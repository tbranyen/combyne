define(function(require, exports, module) {
  "use strict";

  var type = require("./utils/type");
  var map = require("./utils/map");

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
    if (identifier === ".") {
      return "data";
    }

    if (identifier === "i") {
      return "i";
    }

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

    var compiledSource = this.process(this.tree.body);

    // If there is a function, concatenate it to the default empty value.
    if (compiledSource) {
      compiledSource = " + " + compiledSource;
    }

    // The compiled function body.
    var body = [
      // Add baked-in utility methods.
      type, map,

      // Return the evaluated contents.
      "return ''" + compiledSource
    ].join(";");

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

      if (entry.type === "LoopExpression") {
        commands.push(this.compileLoop(entry));
      }

      if (entry.type === "PartialExpression") {
        commands.push(this.compilePartial(entry));
      }
    }, this);

    return commands.join("+");
  };

  Compiler.prototype.compileProperty = function(entry) {
    var identifier = normalizeIdentifier(entry.value);

    var value = [
      // If the identifier is a function, invoke.
      "(", "typeof", identifier, "===", "'function'", "?", identifier + "()",

      ":", identifier, ")"
    ].join(" ");

    // Find any filters and nest them.
    value = entry.filters.reduce(function(memo, filter) {
      var args = filter.args.length ? ", " + filter.args.join(", ") : "";
      return "filters['" + filter.value + "']" + "(" + memo + args + ")";
    }, value);

    return value;
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
      "(", "(", condition, ")", "?", this.process(entry.body), ":", "''", ")"
    ].join("");
  };

  // FIX THIS
  Compiler.prototype.compileLoop = function(entry) {
    var keyVal = [
      // Key
      (entry.conditions[2] ? entry.conditions[2].value : "i"),

      // Value.
      (entry.conditions[3] ? entry.conditions[3].value : "data")
    ].join(",");

    var loop = [
      "map(", normalizeIdentifier(entry.conditions[0].value), ",",
        "function(", keyVal, ") {",
          "return " + this.process(entry.body),
        "}",
      ").join('')"
    ].join("");

    return loop;
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
