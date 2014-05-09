/**
 * @module lib/index
 */
define(function(require, exports, module) {
  "use strict";

  var Grammar = require("./grammar");
  var Tokenizer = require("./tokenizer");
  var Tree = require("./tree");
  var Compiler = require("./compiler");

  // Shared.
  var registerPartial = require("./shared/register_partial");
  var registerFilter = require("./shared/register_filter");

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

    // Internal use only.  Stores the partials and filters.
    this._partials = {};
    this._filters = {};

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
   * @ private
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

  // Attach the shared functions to register partials and filters.
  Combyne.prototype.registerPartial = registerPartial;
  Combyne.prototype.registerFilter = registerFilter;

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
    return this.compiler.func(this.data, this._partials, this._filters);
  };

  // Attach the version number.
  Combyne.VERSION = "0.3.1";

  module.exports = Combyne;
});
