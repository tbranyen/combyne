define(function(require, exports, module) {
  "use strict";

  /**
   * Find the keys of an Object.
   *
   * @param {object} object - to find keys on.
   * @returns {array} of keys.
   */
  function objectKeys(object) {
    var keys = [];

    // Iterate over all keys, including possibly keys on the __proto__ chain.
    for (var key in object) {
      // Ensure that we're only dealing with actual keys of this object.
      if (!object.hasOwnProperty(key)) {
        continue;
      }

      keys.push(key);
    }

    return keys;
  }

  module.exports = objectKeys;
});
