/**
 * Registers filter functions on a template.
 *
 * @module shared/register_filter
 */
define(function(require, exports, module) {
  "use strict";

  /**
   * Registers a filter on the template object.
   *
   * @memberOf module:shared/register_filter
   * @param {string} name - The name to register.
   * @param {function} callback - The callback to trigger for the filter.
   */
  function registerFilter(name, callback) {
    this._filters[name] = callback;

    // Partials are passed down filters from the parent.
    Object.keys(this._partials).forEach(function(partialName) {
      this._partials[partialName]._filters[name] = this._filters[name];
    }, this);
  }

  module.exports = registerFilter;
});
