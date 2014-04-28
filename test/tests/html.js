define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../lib/index");

  describe("HTML", function() {
    it("can be rendered", function() {
      var tmpl = combyne("<html></html>");
      var output = tmpl.render();

      expect(output).to.equal("<html></html>");
    });
  });
});
