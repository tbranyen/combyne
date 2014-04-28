define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../lib/index");

  describe("Partials", function() {
    it("can inject without clobbering the parent", function() {
      var tmpl = combyne("{{test}} {%partial test%}");

      tmpl.registerPartial("test", "{{test}}", { test: "to you" });

      var output = tmpl.render({ test: "hello world" });

      expect(output).to.equal("hello world to you");
    });

    it("can accept an object to use as context", function() {
      var tmpl = combyne("{{test}} {%partial test prop%}");

      tmpl.registerPartial("test", "{{test}}");

      var output = tmpl.render({
        test: "hello world",
        prop: {
          test: "to you"
        }
      });

      expect(output).to.equal("hello world to you");
    });

    it("can render text with an empty context", function() {
      var tmpl = combyne("{{test}} {%partial test%}");

      tmpl.registerPartial("test", "prop", {});

      var output = tmpl.render({ test: "hello world" });

      expect(output).to.equal("hello world prop");
    });

    it("can handle partials in the middle of templates", function() {
      var tmpl = combyne("{{test}} {%partial test%} 123");

      tmpl.registerPartial("test", "prop", {});

      var output = tmpl.render({ test: "hello world" });

      expect(output).to.equal("hello world prop 123");
    });

    it("will error if invalid tokens are present", function() {
      expect(function() {
        var tmpl = combyne("{%partial 5 > 4%}");
        var output = tmpl.render();
      }).to.throw(Error);
    });
  });
});
