define(function(require, exports, module) {
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
});
