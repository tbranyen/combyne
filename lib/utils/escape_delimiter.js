define(function(require, exports, module) {
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
});
