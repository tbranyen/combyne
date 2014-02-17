define(function(require, exports, module) {
  "use strict";

  var Grammar = require("./grammar");
  var Tokenizer = require("./tokenizer");
  var Tree = require("./tree");
  var Compiler = require("./compiler");

  // Utils.
  var type = require("./utils/type");

  /**
   * Represents a Combyne template.
   *
   * @constructor
   * @param {String} template to compile.
   */
  function Combyne(template, data) {
    // Allow this method to run standalone.
    if (!(this instanceof Combyne)) {
      return new Combyne(template, data);
    }

    // Expose the template for easier accessing and mutation.
    this.template = template;

    // Default the data to an empty object.
    this.data = data || {};

    // Store all partials inside this object, exposed so that it can be
    // primed.
    this.partials = {};

    // Store all filters inside this object, exposed so that it can be
    // primed.
    this.filters = {};

    // Ensure the template is a String.
    if (type(this.template) !== "string") {
      throw new Error("Template must be a String.");
    }

    // Refresh the compiler and source.
    this._refresh(Combyne.settings.delimiters);
  }

  /**
   * An internal method used to refresh the compiler and source.
   *
   * @param {Object} delimiters to be used while parsing.
   *
   * @api private
   */
  Combyne.prototype._refresh = function(delimiters) {
    // Create a new grammar with the following values.
    var grammar = new Grammar(delimiters).escape();

    // Break down the template into a series of tokens.
    var stack = new Tokenizer(this.template, grammar).parse();

    // Take the stack and create something resembling an AST.
    var tree = new Tree(stack).make();

    this.tree = tree;
    this.stack = stack;

    // Compile the template function from the tree.
    this.compiler = new Compiler(tree);

    // Update the source.
    this.source = this.compiler.source;
  };

  // Refactor to just use _.defaults implementation.
  Combyne.prototype.setDelimiters = function(local) {
    var delimiters = {};

    function inherits(name) {
      return local[name] || Combyne.settings.delimiters[name];
    }

    delimiters = {
      START_PROP: inherits("START_PROP"),
      END_PROP: inherits("END_PROP"),
      START_EXPR: inherits("START_EXPR"),
      END_EXPR: inherits("END_EXPR"),
      COMMENT: inherits("COMMENT"),
      FILTER: inherits("FILTER")
    };

    this._refresh(delimiters);
  };

  Combyne.prototype.registerPartial = function(name, template, data) {
    this.partials[name] = new Combyne(template, data);
  };

  Combyne.prototype.registerFilter = function(name, callback) {
    this.filters[name] = callback;
  };

  Combyne.filters = {};

  /**
   * Expose the global template settings.
   *
   * @api public
   */
  Combyne.settings = {
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

    // Execute the template function with the correct data.
    return this.compiler.func(this.data, this.partials, this.filters);
  };

  // Attach the version number.
  Combyne.VERSION = "0.3.0";

  module.exports = Combyne;
});
