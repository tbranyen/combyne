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
    Object.keys(this._filters).forEach(function(name) {
      template._filters[name] = this._filters[name];
    }, this);
  }

  module.exports = registerPartial;
});
