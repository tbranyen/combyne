/**
 * Registers partials on a template.
 *
 * @module shared/register_partial
 */
define(function(require, exports, module) {
  "use strict";

  /**
   * Registers a partial on the template object.
   *
   * @memberOf module:shared/register_partial
   * @param {string} name - The name to register.
   * @param {function} template - The template to use as a partial.
   */
  function registerPartial(name, template) {
    this._partials[name] = template;

    // Partials share filters.
    this._partials[name]._filters = this._filters;
  }

  module.exports = registerPartial;
});
