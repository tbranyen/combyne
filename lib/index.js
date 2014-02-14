define(function(require, exports, module) {
  "use strict";

  var Grammar = require("./grammar");
  var Tokenizer = require("./tokenizer");
  var Parser = require("./parser");

  // Utils.
  var type = require("./utils/type");

  /**
   * Represents a Combyne template.
   *
   * @constructor
   * @param {String} template to compile.
   */
  function Combyne(template) {
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
});
