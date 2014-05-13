define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../lib/index");

  describe("HTML", function() {
    it("can be rendered", function() {
      var tmpl = combyne("<html></html>");
      var output = tmpl.render();

      assert.equal(output, "<html></html>");
    });
  });
});
