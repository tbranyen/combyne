define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../lib/index");

  describe("Delimiters", function() {
    it("can be changed on a template", function() {
      var tmpl = combyne("[[test]]", { test: "prop" });

      tmpl.setDelimiters({ START_PROP: "[[", END_PROP: "]]" });

      var output = tmpl.render();

      expect(output).to.equal("prop");
    });

    it("can be incomplete and mixed", function() {
      var tmpl = combyne("[[test}}", { test: "prop" });

      tmpl.setDelimiters({ START_PROP: "[[" });

      var output = tmpl.render();

      expect(output).to.equal("prop");
    });

    it("do not remember previous delimiters", function() {
      var tmpl = combyne("[[one]] {{two}}", { one: "prop", two: "tes" });

      tmpl.setDelimiters({ START_PROP: "[[", END_PROP: "]]" });

      var output = tmpl.render();

      expect(output).to.equal("prop {{two}}");
    });
  });
});
