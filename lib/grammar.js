define(function(require, exports, module) {
  "use strict";

  // Utils.
  var escapeDelimiter = require("./utils/escape_delimiter");

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
      test: new RegExp("^((?!" + string + ").)*")
    });

    return grammar;
  };

  module.exports = Grammar;
});
