define(function(require, exports, module) {
  "use strict";

  var combyne = require("lib/index");

  describe("Comments", function() {
    it("can ignore basic text", function() {
      var output = combyne("{%-- nothing --%}").render();

      expect(output).to.equal("");
    });

    it("ignores invalid comment expressions", function() {
      var output = combyne("--").render();

      expect(output).to.equal("--");
    });

    it("invalid comment and broken expression", function() {
      var output = combyne("{%--").render();

      expect(output).to.equal("");
    });

    it("will not render nested properties", function() {
      var output = combyne("{%--{{test}}--%}").render({
        test: "hello world"
      });

      expect(output).to.equal("");
    });

    it("will not ignore properties outside of it's block", function() {
      var output = combyne("{{hello}}{%--{{test}}--%}").render({
        test: "hello world",
        hello: "goodbye"
      });

      expect(output).to.equal("goodbye");
    });

    it("allows nested comments", function() {
      var output = combyne("{%--{%-- lol --%}--%}har").render();

      expect(output).to.equal("har");
    });

    it("allows nested comments with nested property value", function() {
      var output = combyne("{%--{%-- {{lol}} --%}--%}har").render({
        lol: "hi"
      });

      expect(output).to.equal("har");
    });
  });
});
