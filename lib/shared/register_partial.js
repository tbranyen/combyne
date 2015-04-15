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
   * @param {string} partialName - The name to register.
   * @param {function} template - The template to use as a partial.
   */
  function registerPartial(partialName, template) {
    this._partials[partialName] = template;

    // Partials are passed down filters from the parent.
    for (var name in this._filters) {
      if (!this._filters.hasOwnProperty(name)) { continue; }
      template._filters[name] = this._filters[name];
    }
  }

  module.exports = registerPartial;
});
