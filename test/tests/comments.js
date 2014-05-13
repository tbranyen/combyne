define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../lib/index");

  describe("Comments", function() {
    it("can ignore basic text", function() {
      var output = combyne("{%-- nothing --%}").render();

      assert.equal(output, "");
    });

    it("ignores invalid comment expressions", function() {
      var output = combyne("--").render();

      assert.equal(output, "--");
    });

    it("invalid comment and broken expression", function() {
      var output = combyne("{%--").render();

      assert.equal(output, "");
    });

    it("will not render nested properties", function() {
      var output = combyne("{%--{{test}}--%}").render({
        test: "hello world"
      });

      assert.equal(output, "");
    });

    it("will not ignore properties outside of it's block", function() {
      var output = combyne("{{hello}}{%--{{test}}--%}").render({
        test: "hello world",
        hello: "goodbye"
      });

      assert.equal(output, "goodbye");
    });

    it("allows nested comments", function() {
      var output = combyne("{%--{%-- lol --%}--%}har").render();

      assert.equal(output, "har");
    });

    it("allows nested comments with nested property value", function() {
      var output = combyne("{%--{%-- {{lol}} --%}--%}har").render({
        lol: "hi"
      });

      assert.equal(output, "har");
    });

    it("can comment out end expressions", function() {
      var tmpl = combyne("{%-- %} --%}");
      var output = tmpl.render();

      assert.equal(output, "");
    });
  });
});
