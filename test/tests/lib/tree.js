define(function(require, exports, module) {
  "use strict";

  var Tree = require("../../../lib/tree");

  describe("Tree", function() {
    it("is a constructor", function() {
      expect(Tree).to.be.a("function"); 
    });
  });
});
