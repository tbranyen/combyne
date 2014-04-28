define(function(require, exports, module) {
  "use strict";

  function createObject(scope) {
    function F() {}
    F.prototype = scope;
    return new F();
  }

  module.exports = createObject;
});
