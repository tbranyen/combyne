define(function(require, exports, module) {
  "use strict";

  /**
   * Basic Crockford-ian style Object.create.  I've named it differently from
   * the native implementation.
   *
   * @param {Object} parent - An object to specify as the return prototype.
   * @returns {Object} instance - An object with parent as the prototype.
   */
  function createObject(parent) {
    function F() {}
    F.prototype = parent;
    return new F();
  }

  module.exports = createObject;
});
