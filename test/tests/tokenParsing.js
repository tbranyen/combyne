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

    it("will not error on large files", function() {
      // Timeout increase for older browsers that may be slow at rendering a
      // large file. *Cough IE 7*.
      this.timeout(50000);

      var largeFile = "";

      // Build up a large file to simulate.  Using a for loop instead of an
      // array since IE 8 was erroring with out-of-memory errors.
      for (var i = 0; i < 10000; i++) {
        largeFile += "<test>";
      }

      var template = combyne(largeFile);
      var output = template.render();

      assert.equal(output, largeFile);
    });
  });
});
