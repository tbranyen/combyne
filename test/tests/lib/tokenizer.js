define(function(require, exports, module) {
  "use strict";

  var Tokenizer = require("../../../lib/tokenizer");

  describe("Tokenizer", function() {
    it("is a constructor", function() {
      expect(Tokenizer).to.be.a("function"); 
    });
  });
});
