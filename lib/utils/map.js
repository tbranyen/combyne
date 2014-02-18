define(function(require, exports, module) {
  "use strict";

  var type = require("./type");

  /**
   * Allows iteration of an Array, Arguments, NodeList, or plain Object.
   *
   * @param {*} obj or array to iterate.
   * @param {Function} iterator that is called within the template.
   * @return {Array} of String output to be joined.
   */
  function map(obj, iterator) {
    var isArrayLike = (type(obj) === "arguments" || type(obj) === "nodelist");
    var isArray = Array.isArray(obj) || isArrayLike;
    var output = [];
    var i;

    // Make a clone of the Array to operate on.
    if (isArray) {
      obj = [].slice.call(obj);

      for (i = 0; i < obj.length; i++) {
        output.push(iterator(i, obj[i]));
      }

      return output;
    }
    // Iterate the object.
    else {
      for (i in obj) {
        output.push(iterator(i, obj[i]));
      }
    }
  }

  module.exports = map;
});