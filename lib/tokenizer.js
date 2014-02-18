define(function(require, exports, module) {
  "use strict";

  /**
   * Represents a Tokenizer.
   *
   * @constructor
   * @param {String} template to tokenize.
   * @param {Array} grammar to test against.
   */
  function Tokenizer(template, grammar) {
    this.template = template;
    this.grammar = grammar;
    this.stack = [];
  }

  /**
   * Loop through the grammar and return on the first source match.  Remove
   * matches from the source, after pushing to the stack.
   *
   * @param {String} template that is searched on till its length is 0.
   * @param {Array} grammar array of test regexes.
   * @param {Array} stack to push found tokens to.
   *
   * @return {String} template that has been truncated.
   */
  function parseNextToken(template, grammar, stack) {
    grammar.some(function(token) {
      var capture = token.test.exec(template);

      // Ignore empty captures.
      if (capture && capture[0]) {
        template = template.replace(token.test, "");
        stack.push({ name: token.name, capture: capture });
        return true;
      }
    });

    return template;
  }

  /**
   * Parses the template into a series of tokens.
   *
   * @return {Array} stack.
   */
  Tokenizer.prototype.parse = function() {
    var template = this.template;
    var grammar = this.grammar;
    var stack = this.stack;
    var stackLen = 0;

    // While the template still needs to be parsed, loop.
    while (template.length) {
      template = parseNextToken(template, grammar, stack);
      stackLen = stack.length;

      // Add the previous token, if it exists.
      if (stackLen - 2 >= 0) {
        stack[stackLen - 1].previous = stack[stackLen - 2];
      }
    }

    return stack;
  };

  module.exports = Tokenizer;
});
