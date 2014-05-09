define(function(require, exports, module) {
  "use strict";

  /**
   * Registers a filter on the template object.
   *
   * @param {string} name - the name to register.
   * @param {function} callback - the callback to trigger for the filter.
   */
  var registerFilter = function(name, callback) {
    this._filters[name] = callback;
  };

  module.exports = registerFilter;
});
