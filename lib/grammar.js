/**
 * Defines the grammer to use when parsing the template for tokens.
 *
 * @module grammar
 * @requires utils/escape_delimiter
 */
define(function(require, exports, module) {
  "use strict";

  // Utils.
  var escapeDelimiter = require("./utils/escape_delimiter"),
      breakString;

  // Support.
  require("./support/array/map");
  require("./support/array/some");

  /**
   * Represents a Grammar.
   *
   * @class
   * @memberOf module:grammar
   * @param {object} delimiters - Delimiters to use store and use internally.
   */
  function Grammar(delimiters) {
    this.delimiters = delimiters;

    this.internal = [
        {
          name: "START_IF",
          value: "if",
          cantStartWord: false
        },
        {
          name: "ELSE",
          value: "else",
          cantStartWord: false
        },
        {
          name: "ELSIF",
          value: "elsif",
          cantStartWord: false
        },
        {
          name: "END_IF",
          value: "endif",
          cantStartWord: false
        },
        {
          name: "NOT",
          value: "not",
          cantStartWord: false
        },
        {
          name: "EQUALITY",
          value: "==",
          cantStartWord: true
        },
        {
          name: "NOT_EQUALITY",
          value: "!=",
          cantStartWord: true
        },
        {
          name: "GREATER_THAN_EQUAL",
          value: ">=",
          cantStartWord: true
        },
        {
          name: "GREATER_THAN",
          value: ">",
          cantStartWord: true
        },
        {
          name: "LESS_THAN_EQUAL",
          value: "<=",
          cantStartWord: true
        },
        {
          name: "LESS_THAN",
          value: "<",
          cantStartWord: true
        },
        {
          name: "START_EACH",
          value: "each",
          cantStartWord: false
        },
        {
          name: "END_EACH",
          value: "endeach",
          cantStartWord: false
        },
        {
          name: "ASSIGN",
          value: "as",
          cantStartWord: false
        },
        {
          name: "PARTIAL",
          value: "partial",
          cantStartWord: false
        },
        {
          name: "START_EXTEND",
          value: "extend",
          cantStartWord: false
        },
        {
          name: "END_EXTEND",
          value: "endextend",
          cantStartWord: false
        },
        {
          name: "MAGIC",
          value: ".",
          cantStartWord: true
        }
    ]

    breakString = "\\s|" + Object.keys(this.delimiters).map(function(key) {
      return escapeDelimiter(this.delimiters[key]);
    }, this)
    .join("|").concat(this.internal.map(function(internal) {
      return escapeDelimiter(internal.value);
    }, this).join("|"));

    this.internal = this.internal.map(function(internal) {
      return makeEntry(internal.name, internal.value, internal.cantStartWord);
    }, this).reduce(function(a, b) {
      return a.concat(b);
    });
  }

  /**
   * Abstract the logic for adding items to the grammar.
   *
   * @private
   * @param {string} name - Required to identify the match.
   * @param {string} value - To be escaped and used within a RegExp.
   * @returns {object} The normalized metadata.
   */
  function makeEntry(name, value, cantStartWord) {
    var escaped = escapeDelimiter(value);
    var out = [];
    if (cantStartWord) {

      out.push("(^" + escaped + ")");
    }
    else {
      out.push("(^" + escaped + "$)");
      out.push("(^" + escaped + ")(" + breakString + ")");
    }

    return out.map(function(toOutput) {
      return {
        name: name,
        escaped: toOutput.replace("^", "").replace("^", ""),
        test: new RegExp(toOutput)// + escaped + "$")
      };
    }, this);
  }

  /**
   * Escape the stored delimiters.
   *
   * @memberOf module:grammar.Grammar
   * @returns {array} Metadata describing the grammar.
   */
  Grammar.prototype.escape = function() {
    // Order matters here.
    var grammar = [
      "START_RAW",
      "START_PROP",
      "START_EXPR",
      "END_RAW",
      "END_PROP",
      "END_EXPR",
      "COMMENT",
      "FILTER"
    ];

    // Add all normalized delimiters into the grammar.
    grammar = grammar.map(function(key) {
      return makeEntry(key, this.delimiters[key], true);
    }, this).reduce(function(a, b) {
      return a.concat(b);
    });

    // Add all normalized internals into the grammar.
    grammar.push.apply(grammar, this.internal);

    // Take the current grammar and craft the remaining valid string values.
    var string = grammar.map(function(value) {
      return value.escaped;
    }).join("|");

    // Add whitespace to grammar.
    grammar.splice(0, 0, {
      name: "WHITESPACE",
      test: /^(\s+)/
    });

    // Add whitespace to the whitelist.
    string += "|\\s";

    // The everything-else bucket.
    grammar.push({
      name: "OTHER",
      test: new RegExp("^(((?!" + string + ").)*)")
    });

    this.breakString = breakString;
    return grammar;
  };

  module.exports = Grammar;
});
