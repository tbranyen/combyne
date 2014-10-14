define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../lib/index");

  describe("Whitespace", function() {
    it("does not add around properties", function() {
      var template = combyne("{{ hasStuff }}");
      var output = template.render({ hasStuff: "hello" });

      assert.equal(output, "hello");
    });

    it("preserves around properties", function() {
      var template = combyne("\n {{ hasStuff }} ");
      var output = template.render({ hasStuff: "hello" });

      assert.equal(output, "\n hello ");
    });

    it("is removed around expressions if formatted for style", function() {
      var template = combyne("\n    {%-- \nhasStuff \n--%}test ");
      var output = template.render({ hasStuff: "hello" });

      assert.equal(output, "\n    test ");
    });

    it("is preserved around an expression with no newlines ", function() {
      var template = combyne("    {%-- hasStuff --%}test ");
      var output = template.render({ hasStuff: "hello" });

      assert.equal(output, "    test ");
    });

    it("is preserved around expressions if intentional", function() {
      var template = combyne("    {%-- hasStuff --%} ");
      var output = template.render({ hasStuff: "hello" });

      assert.equal(output, "     ");
    });

    it("can format a simple each", function() {
      var template = combyne([
        "{%each items as item%}",
        "test{{item}}",
        "{%endeach%}"
      ].join("\n"));
      var output = template.render({ hasStuff: "hello", items: [0, 1, 2, 3] });

      assert.equal(output, "test0\ntest1\ntest2\ntest3\n");
    });

    it("is removed between expressions with a newline", function() {
      var template = combyne([
        "{%each items as item%}",
        "  {%if item%}",
        "    {{item}}",
        "  {%endif%}",
        "{%endeach%}"
      ].join("\n"));
      var output = template.render({ hasStuff: "hello", items: [0, 1, 2, 3] });

      assert.equal(output, "    1\n    2\n    3\n");
    });
  });
});

