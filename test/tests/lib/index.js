define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../../lib/index");

  describe("The exported Combyne module", function() {
    it("is a function", function() {
      assert.ok(typeof combyne === "function");
    });

    it("is a valid constructor", function() {
      assert.ok(combyne("") instanceof combyne);
      assert.ok(new combyne("") instanceof combyne);
    });

    it("requires the template argument to be a string", function() {
      assert.throws(combyne);
    });
  });
});
