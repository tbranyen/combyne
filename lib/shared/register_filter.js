define(function(require, exports, module) {
  "use strict";

  var registerFilter = function(name, callback) {
    this._filters[name] = callback;
  };

  module.exports = registerFilter;
});
