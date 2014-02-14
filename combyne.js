(function(window, factory) {
  "use strict";

  // AMD. Register as an anonymous module.  Wrap in function so we have access
  // to root via `this`.
  if (typeof define === "function" && define.amd) {
    return define([], function() {
      return factory.apply(window, arguments);
    });
  }
  
  // Node. Does not work with strict CommonJS, but only CommonJS-like
  // enviroments that support module.exports, like Node.
  else if (typeof exports === "object") {
    module.exports = factory();
  }

  // Browser globals.
  else {
    window.combyne = factory.call(window);
  }
}(typeof global === "object" ? global : this, function() {
  "use strict";

  // The exports object that contains all modules.
  var combyne = {};

  // Set window to always equal the global object.
  var window = this;

  combyne['utils/type'] = (function() {
    var module = { exports: {} };

    var retVal = (function(require, exports, module) {
      "use strict";

      // Cache this method for easier reusability.
      var toString = Object.prototype.toString;

      /**
       * Determine the type of a given value.
       *
       * @param {*} value to test.
       * @return {Boolean} that indicates the value's type.
       */
      function type(value) {
        return toString.call(val).split(" ")[1].slice(0, -1).toLowerCase();
      }

      module.exports = type;
    })(null, module.exports, module);

    return retVal || module.exports;
  })();

  combyne['utils/escape_delimiter'] = (function() {
    var module = { exports: {} };

    var retVal = (function(require, exports, module) {
      "use strict";

      var specialCharsExp = /[\^$\\\/.*+?()\[\]{}|]/g;

      /**
       * Escape special characters that may interfere with RegExp building.
       *
       * @param {String} delimiter value to escape.
       * @return {String} safe value for RegExp building.
       */
      function escapeDelimiter(delimiter) {
        return delimiter.replace(specialCharsExp,"\\$&");
      }

      module.exports = escapeDelimiter;
    })(null, module.exports, module);

    return retVal || module.exports;
  })();

  combyne.grammar = (function() {
    var module = { exports: {} };

    var retVal = (function(require, exports, module) {
      "use strict";

      // Utils.
      var type = combyne['utils/type'];
      var escapeDelimiter = combyne['utils/escape_delimiter'];

      function Grammar(delimiters) {
        this.delimiters = delimiters;
      }

      Grammar.prototype.escape = function() {
        var keys = Object.keys(this.delimiters);
        var grammar = [];

        var string = keys.map(function(key) {
          var escaped = escapeDelimiter(this.delimiters[key]);

          // Add to the grammar list.
          grammar.push({
            name: key,
            test: new RegExp("^" + escaped)
          });

          return escaped;
        }, this).join("|");

        grammar.push({
          name: "WHITESPACE",
          test: /^[\ |\t|\r|\n]+/
        });

        grammar.push({
          name: "OTHER",
          test: RegExp("^((?!" + string + ").)*")
        });

        return grammar;
      };

      module.exports = Grammar;
    })(null, module.exports, module);

    return retVal || module.exports;
  })();

  combyne.tokenizer = (function() {
    var module = { exports: {} };

    var retVal = (function(require, exports, module) {
      "use strict";

      /**
       * Represents a Tokenizer.
       *
       * @constructor
       * @param {String} template to tokenize.
       * @param {Array} grammar to match against.
       */
      function Tokenizer(template, grammar) {
        this.template = template;
        this.grammar = grammar;
        this.stack = [];
      }

      /**
       * Parses the template into a series of tokens.
       *
       * @return {Array} tokens as a stack.
       */
      Tokenizer.prototype.parse = function() {
        var template = this.template;
        var grammar = this.grammar;

        // While the template still needs to be parsed, loop.
        while (template.length) {
          // Loop through each item in the grammar.
          grammar.forEach(function(token) {
            var capture = token.test.exec(template);

            // If the grammar regex matches the template, token it.
            if (capture && capture[0]) {
              // Remove from the template.
              template = template.replace(token.test, "");

              // Push the capture.
              this.stack.push({ name: token.name, capture: capture });
            }
          }, this);
        }

        return this.stack;
      };

      module.exports = Tokenizer;
    })(null, module.exports, module);

    return retVal || module.exports;
  })();

  combyne.parser = (function() {
    var module = { exports: {} };

    var retVal = (function(require, exports, module) {
      "use strict";

      /**
       *
       *
       */
      function Parser(stack) {
        this.stack = stack;
      }

      Parser.prototype.toJavaScript = function() {
        var output = "console.log('turd');";

        return new Function(output);
      };

      module.exports = Parser;
    })(null, module.exports, module);

    return retVal || module.exports;
  })();

  combyne.index = (function() {
    var module = { exports: {} };

    var retVal = (function(require, exports, module) {
      "use strict";

      var Grammar = combyne.grammar;
      var Tokenizer = combyne.tokenizer;
      var Parser = combyne.parser;

      // Utils.
      var type = combyne['utils/type'];

      /**
       * Represents a Combyne template.
       *
       * @constructor
       * @param {String} template to compile.
       */
      function Combyne(template, delimiters) {
        // Allow this method to run standalone.
        if (!(this instanceof Combyne)) {
          return new Combyne(template);
        }

        // Expose the template for easier accessing and mutation.
        this.template = template;
        // Default the data to an empty object.
        this.data = {};

        // Ensure the template is a String.
        if (type(this.template) !== "string") {
          throw new Error("Template must be a String.");
        }

        // Create a new grammar with the following values.
        var grammar = new Grammar(Combyne.templateSettings.delimiters);
        // Break down the template into a series of tokens.
        var tokenizer = new Tokenizer(this.template, grammar.escape());
        // Parse the template into a stack of tokens.
        var stack = tokenizer.parse();
        // Use the stack to parse into beautiful JavaScript.
        var parser = new Parser(stack);

        // Generate the template function from the stack.
        this.templateFunction = parser.toJavaScript();
      }

      /**
       * Expose the global template settings.
       *
       * @api public
       */
      Combyne.templateSettings = {
        // Custom delimiters may be changed here.
        delimiters: {
          START_PROP: "{{",
          END_PROP: "}}",
          START_EXPR: "{%",
          END_EXPR: "%}",
          COMMENT: "--",
          FILTER: "|"
        }
      };

      /**
       *
       */
      Combyne.prototype.render = function(data) {
        // Override the template data if provided.
        this.data = data || this.data;

        // Ensure the data is an Object.
        if (type(this.data) !== "object") {
          throw new Error("Template data must be an Object.");
        }

        // Execute the template function with the correct data.
        return this.templateFunction(this.data);
      };

      // Attach the version number.
      Combyne.VERSION = "0.3.0";

      module.exports = Combyne;
    })(null, module.exports, module);

    return retVal || module.exports;
  })();

  return combyne.index;
}));