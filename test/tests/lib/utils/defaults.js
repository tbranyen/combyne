define(function(require, exports, module) {
  "use strict";

  var defaults = require("../../../../lib/utils/defaults");
  var createObject = require("../../../../lib/utils/create_object");

  describe("Defaults", function() {
    it("is a function", function() {
      assert.ok(typeof defaults === "function");
    });

    it("ignores prototype properties", function() {
      var a = createObject({ e: false });

      a.d = true;
      a.f = "";

      var c = { g: 5 };

      assert.equal(defaults(c, a).e, undefined);
    });
  });
});
