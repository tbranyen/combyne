define(function(require, exports, module) {
  "use strict";

  var type = require("./type");
  var createObject = require("./create_object");

  /**
   * Allows iteration of an Array, Arguments, NodeList, or plain Object.
   *
   * @param {*} obj or array to iterate.
   * @param {String} index identifier name.
   * @param {String} value identifier name.
   * @param {object} data from outer scope.
   * @param {Function} iterator that is called within the template.
   * @return {Array} of String output to be joined.
   */
  function map(obj, index, value, data, iterator) {
    var isArrayLike = (type(obj) === "arguments" || type(obj) === "nodelist");
    var isArray = Array.isArray(obj) || isArrayLike;
    var output = [];
    var i;
    var dataObject;

    // Make a clone of the Array to operate on.
    if (isArray) {
      obj = [].slice.call(obj);

      for (i = 0; i < obj.length; i++) {
        // Create a new scoped data object.
        dataObject = createObject(data);
        dataObject[index] = i;
        dataObject[value] = obj[i];

        output.push(iterator(dataObject));
      }

      return output;
    }
    // Iterate the object.
    else {
      for (i in obj) {
        if (!obj.hasOwnProperty(i)) {
          continue;
        }

        // Create a new scoped data object.
        dataObject = createObject(data);
        dataObject[index] = i;
        dataObject[value] = obj[i];

        output.push(iterator(dataObject));
      }

      return output;
    }
  }

  module.exports = map;
});
