define(function(require, exports, module) {
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
   *
   */
  function parseNextToken(template, grammar, stack) {
    // Loop through each item in the grammar, until a match is found.
    grammar.some(function(token) {
      var capture = token.test.exec(template);

      // If the grammar regex matches the template, token it.
      if (capture && capture[0]) {
        // Remove from the template.
        template = template.replace(token.test, "");

        // Push the capture.
        stack.push({ name: token.name, capture: capture });

        // Short circuit the loop.
        return true;
      }
    });

    return template;
  }

  /**
   * Parses the template into a series of tokens.
   *
   * @return {Array} tokens as a stack.
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
