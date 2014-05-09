define(function(require, exports, module) {
  "use strict";

  var registerPartial = function(name, template) {
    this._partials[name] = template;

    // Partials share filters.
    this._partials[name]._filters = this._filters;
  };

  module.exports = registerPartial;
});
