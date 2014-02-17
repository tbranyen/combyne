define(function(require, exports, module) {
  "use strict";

  // Utils.
  var escapeDelimiter = require("./utils/escape_delimiter");

  function Grammar(delimiters) {
    this.delimiters = delimiters;

    this.internal = [
      makeEntry("START_IF", "if"),
      makeEntry("ELSE", "else"),
      makeEntry("ELSIF", "elsif"),
      makeEntry("END_IF", "endif"),
      makeEntry("NOT", "not"),
      makeEntry("EQUALITY", "=="),
      makeEntry("NOT_EQUALITY", "!="),
      makeEntry("GREATER_THAN_EQUAL", ">="),
      makeEntry("GREATER_THAN", ">"),
      makeEntry("LESS_THAN_EQUAL", "<="),
      makeEntry("LESS_THAN", "<"),
      makeEntry("NOT", "not"),
      makeEntry("START_EACH", "each"),
      makeEntry("END_EACH", "endeach"),
      makeEntry("ASSIGN", "as"),
      makeEntry("PARTIAL", "partial"),
      makeEntry("MAGIC", ".")
    ];
  }

  /**
   * Abstract the logic for adding items to the grammar.
   *
   * @param {String} name to identify the match.
   * @param {String} value that will be escaped and used within a RegExp.
   * @return {Object} containing the normalied metadata.
   */
  function makeEntry(name, value) {
    var escaped = escapeDelimiter(value);

    return {
      name: name,
      escaped: escaped,
      test: new RegExp("^" + escaped)
    };
  }

  /**
   * Escape the passed in delimiters.
   *
   * @return {Array} of metadata describing the grammar.
   */
  Grammar.prototype.escape = function() {
    var keys = Object.keys(this.delimiters);
    var grammar = [];

    // Add all normalized delimiters into the grammar.
    keys.forEach(function(key) {
      grammar.push(makeEntry(key, this.delimiters[key]));
    }, this);

    // Add all normalized internals into the grammar.
    grammar.push.apply(grammar, this.internal);

    // Take the current grammar and craft the remaining valid string values.
    var string = grammar.map(function(value) {
      return value.escaped;
    }).join("|");

    grammar.push({
      name: "WHITESPACE",
      test: /^[\ |\t|\r|\n]+/
    });

    // Add whitespace to the whitelist.
    string += "| |\t|\r|\n";

    grammar.push({
      name: "OTHER",
      test: new RegExp("^((?!" + string + ").)*")
    });

    return grammar;
  };

  module.exports = Grammar;
});
