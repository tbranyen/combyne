/**
 * @module lib/utils/escape_delimiter
 */
define(function(require, exports, module) {
  "use strict";

  var specialCharsExp = /[\^$\\\/.*+?()\[\]{}|]/g;

  /**
   * Escape special characters that may interfere with RegExp building.
   *
   * @private
   * @param {String} delimiter value to escape.
   * @returns {String} safe value for RegExp building.
   */
  function escapeDelimiter(delimiter) {
    return delimiter.replace(specialCharsExp,"\\$&");
  }

  module.exports = escapeDelimiter;
});
