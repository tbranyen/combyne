define(function(require, exports, module) {
  "use strict";

  var combyne = require("lib/index");

  describe("The exported Combyne module", function() {
    it("is a function", function() {
      expect(combyne).to.be.a("function");
    });

    it("is a valid constructor", function() {
      expect(combyne("")).to.be.an.instanceof(combyne);
      expect(new combyne("")).to.be.an.instanceof(combyne);
    });

    it("requires the template argument to be a string", function() {
      expect(combyne).to.throw(Error);
    });
  });
});
