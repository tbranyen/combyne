/**
 * Determines the type of a passed in value.
 *
 * @module utils/type
 */
define(function(require, exports, module) {
  "use strict";

  // Cache this method for easier reusability.
  var toString = Object.prototype.toString;

  /**
   * Determine the type of a given value.
   *
   * @memberOf module:utils/type
   * @param {*} value - A value to test.
   * @returns {string} The value's type.
   */
  function type(value) {
    return toString.call(value).slice(8, -1).toLowerCase();
  }

  module.exports = type;
});
