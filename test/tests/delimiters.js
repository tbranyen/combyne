define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../lib/index");

  describe("Delimiters", function() {
    after(function() {
      combyne.settings.delimiters.START_PROP = "{{";
      combyne.settings.delimiters.END_PROP = "}}";
    });

    it("can be changed on a template", function() {
      combyne.settings.delimiters = {
        START_PROP: "[[", END_PROP: "]]"
      };

      var tmpl = combyne("[[test]]", { test: "prop" });

      var output = tmpl.render();
      assert.equal(output, "prop");
    });

    it("can be incomplete and mixed", function() {
      combyne.settings.delimiters = {
        START_PROP: "[["
      };

      var tmpl = combyne("[[test}}", { test: "prop" });

      var output = tmpl.render();
      assert.equal(output, "prop");
    });

    it("do not remember previous delimiters", function() {
      combyne.settings.delimiters = {
        START_PROP: "[[", END_PROP: "]]" 
      };

      var tmpl = combyne("[[one]] {{two}}", { one: "prop", two: "tes" });
      var output = tmpl.render();

      assert.equal(output, "prop {{two}}");
    });
  });
});
