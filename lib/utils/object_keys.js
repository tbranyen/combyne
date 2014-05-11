/**
 * Iterates an Object to collect an Array of its key names.
 *
 * @module utils/object_keys
 */
define(function(require, exports, module) {
  "use strict";

  /**
   * Find the keys of an Object.
   *
   * @memberOf module:utils/object_keys
   * @param {object} obj - Object to collect keys from.
   * @returns {array} An Array of keys.
   */
  function objectKeys(obj) {
    var keys = [];

    for (var key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }

      keys.push(key);
    }

    return keys;
  }

  module.exports = objectKeys;
});
