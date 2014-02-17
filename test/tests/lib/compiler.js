define(function(require, exports, module) {
  "use strict";

  var Compiler = require("lib/compiler");

  describe("Compiler", function() {
    it("is a constructor", function() {
      expect(Compiler).to.be.a("function"); 
    });
  });
});
