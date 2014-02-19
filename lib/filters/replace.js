define(function(require, exports, module) {
  "use strict";

  function replace(value, before, after) {
    return value.replace(new RegExp(before, "g"), after);
  }

  module.exports = replace;
});
