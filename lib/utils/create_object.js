/**
 * @module lib/utils/create_object
 */
define(function(require, exports, module) {
  "use strict";

  /**
   * Basic Crockford-ian style Object.create.  I've named it differently from
   * the native implementation.
   *
   * @private
   * @param {Object} parent - An object to specify as the return prototype.
   * @returns {object} instance - an object with parent as the prototype.
   */
  function createObject(parent) {
    function F() {}
    F.prototype = parent;
    return new F();
  }

  module.exports = createObject;
});
