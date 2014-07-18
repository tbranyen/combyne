define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../lib/index");

  describe("Basic rendering", function() {
    it("renders without adding unnecessary leading whitespace", function() {
      var template = combyne("{%each items as item%}\n{{item}}\n{%endeach%}");
      var output = template.render({ items: [1, 2, 3] });

      assert.equal(output, "1\n2\n3");
    });

    it("renders without adding unnecessary trailing whitespace", function() {
      var template = combyne("{%each items as item%}\n{{item}}\n{%endeach%}\n");
      var output = template.render({ items: [1, 2, 3] });

      assert.equal(output, "1\n2\n3\n");
    });

    it("renders without destroying necessary whitespace", function() {
      var template = combyne("{%each items as item%}\n\n{{item}}{%endeach%}");
      var output = template.render({ items: [1, 2, 3] });

      assert.equal(output, "1\n\n2\n\n3");
    });
  });
});
