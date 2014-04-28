define(function(require, exports, module) {
  "use strict";

  var Grammar = require("../../../lib/compiler");

  describe("Grammar", function() {
    it("is a constructor", function() {
      expect(Grammar).to.be.a("function"); 
    });
  });
});
