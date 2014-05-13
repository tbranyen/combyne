define(function(require, exports, module) {
  "use strict";

  var escapeDelimiter = require("../../../../lib/utils/escape_delimiter");

  describe("Escape delimiter", function() {
    it("is a function", function() {
      assert.ok(typeof escapeDelimiter === "function"); 
    });
  });
});
