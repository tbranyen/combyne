define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../lib/index");

  describe("Token parsing", function() {
    it("parses properties containing reserved words", function() {
      var template = combyne("{{ hasStuff }}");
      var output = template.render({ hasStuff: "hello" });

      assert.equal(output, "hello");
    });

    it("parses properties starting with reserved words", function() {
      var template = combyne("{{ assignment }}");
      var output = template.render({ assignment: "hello" });

      assert.equal(output, "hello");
    });

    it("parses whitespaces inside of literals", function() {
      var template = combyne("{%if hello == 'test this'%}hello{%endif%}");
      var output = template.render({ hello: 'test this' });

      assert.equal(output, "hello");
    });

    it("ignores whitespaces inside of properties", function() {
      var template = combyne("{{ hello }}");
      var output = template.render({ hello: 'hello' });

      assert.equal(output, "hello");
    });

    it("ignores whitespaces inside of raw properties", function() {
      var template = combyne("{{{ hello }}}");
      var output = template.render({ hello: 'hello' });

      assert.equal(output, "hello");
    });

    it("ignores whitespaces inside of properties that are inside of strings", function() {
      var template = combyne("'{{ hello }} world'");
      var output = template.render({ hello: 'hello' });

      assert.equal(output, "'hello world'");
    });
  });
});
