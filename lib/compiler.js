define(function(require, exports, module) {
  "use strict";

  var type = require("./utils/type");
  var map = require("./utils/map");
  var createObject = require("./utils/create_object");

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
      return "data['.']";
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
      type, map, createObject,

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
      switch (entry.type) {
        case "Property": {
          commands.push(this.compileProperty(entry));
          break;
        }

        case "ConditionalExpression": {
          commands.push(this.compileConditional(entry));
          break;
        }

        case "LoopExpression": {
          commands.push(this.compileLoop(entry));
          break;
        }

        case "PartialExpression": {
          commands.push(this.compilePartial(entry));
          break;
        }

        default: {
          commands.push("'" + escapeValue(entry.value) + "'");
        }
      }
    }, this);

    return commands.join("+");
  };

  Compiler.prototype.compileProperty = function(entry) {
    var identifier = entry.value;

    if (identifier.indexOf("'") === -1 && identifier.indexOf("\"") === -1) {
      identifier = normalizeIdentifier(entry.value);
    }

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

    // If an else was provided, hook into it.
    var els = entry.els ? this.process(entry.els.body) : null;

    // If an elsif was provided, hook into it.
    var elsif = entry.elsif ? this.compileConditional(entry.elsif) : null;

    return [
      "(", "(", condition, ")", "?", this.process(entry.body), ":",

      els || elsif || "''",

      ")"
    ].join("");
  };

  // FIX THIS
  Compiler.prototype.compileLoop = function(entry) {
    var keyVal = [
      // Key
      (entry.conditions[3] ? entry.conditions[3].value : "i"),

      // Value.
      (entry.conditions[2] ? entry.conditions[2].value : ".")
    ];

    var loop = [
      "map(", normalizeIdentifier(entry.conditions[0].value), ",",

        // Index keyword.
        "'", keyVal[0], "'", ",",

        // Value keyword.
        "'", keyVal[1], "'", ",",

        // Outer scope data object.
        "data", ",",

        // The iterator function.
        "function(data) {",
          "return " + this.process(entry.body, keyVal),
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
