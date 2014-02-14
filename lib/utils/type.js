define(function(require, exports, module) {
  "use strict";

  // Cache this method for easier reusability.
  var toString = Object.prototype.toString;

  /**
   * Determine the type of a given value.
   *
   * @param {*} value to test.
   * @return {Boolean} that indicates the value's type.
   */
  function type(value) {
    return toString.call(val).split(" ")[1].slice(0, -1).toLowerCase();
  }

  module.exports = type;
});
