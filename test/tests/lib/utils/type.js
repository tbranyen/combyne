define(function(require, exports, module) {
  "use strict";

  var type = require("lib/utils/type");

  describe("Type", function() {
    it("is a function", function() {
      expect(type).to.be.a("function"); 
    });
  });
});
