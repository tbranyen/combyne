/**
 * Legacy support for browsers that don't support Array.prototype.forEach.
 *
 * @module: support/array_for_each
 */
define(function(require, exports, module) {
  "use strict";

  // This polyfill isn't necessary.
  if (Array.prototype.forEach) {
    return;
  }

  /**
   * A polyfill for Array#forEach.  Modified from MDN.
   *
   * @memberOf module:support/array_for_each
   * @param {function} iterator - An interator function to call.
   * @param {object} thisArg - An optional context to pass.
   */
  Array.prototype.forEach = function(iterator, thisArg) {
    // Ensure called with a valid context.
    if (this == null) {
      throw new TypeError();
    }

    // Ensure a function was passed as the iterator.
    if (typeof iterator !== "function") {
      throw new TypeError();
    }

    // Coerce this value to an Array.
    var array = Array.prototype.slice.call(this);

    for (var i = 0; i < array.length; i++) {
      if (i in array) {
        iterator.call(thisArg || this, array[i], i, array);
      }
    }
  };
});
