define(function(require, exports, module) {
  "use strict";

  /**
   * Registers a partial on the template object.
   *
   * @param {string} name - the name to register.
   * @param {function} template - the template to use as a partial.
   */
  var registerPartial = function(name, template) {
    this._partials[name] = template;

    // Partials share filters.
    this._partials[name]._filters = this._filters;
  };

  module.exports = registerPartial;
});
