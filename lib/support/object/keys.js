/**
 * Legacy support for browsers that don"t support Object.keys.
 *
 * @module:support/object/keys
 */
define(function(require, exports, module) {
  "use strict";

  // This polyfill isn't necessary.
  if (Object.keys) {
    return keys;
  }

  var hasDontEnumBug = !({toString: null}).propertyIsEnumerable("toString");
  var dontEnums = [
    "toString",
    "toLocaleString",
    "valueOf",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "constructor"
  ];

  /**
   * A polyfill for Object.keys.  Modified from MDN.
   *
   * @memberOf module:support/object/keys
   * @param {object} obj - An object to find keys on.
   */
  function keys(obj) {
    // Ensure an object was passed as the iterator.
    if (typeof obj !== "object" && typeof obj !== "function" || obj == null) {
      throw new TypeError();
    }

    // Store keys.
    var result = [];

    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        result.push(prop);
      }
    }

    if (hasDontEnumBug) {
      for (var i = 0; i < dontEnums.length; i++) {
        if (obj.hasOwnProperty(dontEnums[i])) {
          result.push(dontEnums[i]);
        }
      }
    }

    return result;
  }

  module.exports = Object.keys = keys;
});
