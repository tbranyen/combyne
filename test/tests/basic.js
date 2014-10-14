define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../lib/index");

  // Support.
  require("../../lib/support/string/trim_left");

  describe("Basic rendering", function() {
    it("can render without any whitespace", function() {
      var template = combyne("{%each items as item%}{{item}}{%endeach%}");
      var output = template.render({ items: [1, 2, 3] });

      assert.equal(output, "123");
    });

    it("renders without adding unnecessary whitespace", function() {
      var template = combyne("{%each items as item%}\n{{item}}\n{%endeach%}");
      var output = template.render({ items: [1, 2, 3] });

      assert.equal(output, "1\n2\n3\n");
    });

    it("renders without adding unnecessary trailing whitespace", function() {
      var template = combyne("{%each items as item%}\n{{item}}\n{%endeach%}\n");
      var output = template.render({ items: [1, 2, 3] });

      assert.equal(output, "1\n2\n3\n");
    });

    it("renders without destroying necessary whitespace", function() {
      var template = combyne("{%each items as item%}\n\n\n{{item}}{%endeach%}");
      var output = template.render({ items: [1, 2, 3] });

      assert.equal(output, "\n\n1\n\n2\n\n3");
    });

    it("does not carry over whitespace from delimiters", function() {
      var text = [
        "{%each items as item%}",
          "{%if item%}",
            "{{item}}",
          "{%endif%}",
        "{%endeach%}"
      ].join("\n");

      var template = combyne(text);
      var output = template.render({ items: [0, 1, 2, 3] });

      assert.equal(output, "1\n2\n3\n");
    });

    it("trims leading whitespace around delimiters", function() {
      var text = [
        "{%each items as item%}",
        "  {%if item%}",
        "    {{item}}",
        "  {%endif%}",
        "{%endeach%}",
        "test"
      ].join("\n");

      var template = combyne(text);
      var output = template.render({ items: [0, 1, 2, 3] });

      assert.equal(output, "    1\n    2\n    3\ntest");
    });
  });
});
