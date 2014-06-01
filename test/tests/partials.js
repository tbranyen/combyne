define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../lib/index");

  describe("Partials", function() {
    it("will error if invalid partial name is provided", function() {
      assert.throws(function() {
        var tmpl = combyne("{%partial%}");
        var output = tmpl.render();
      });
    });

    it("can inject without clobbering the parent", function() {
      var tmpl = combyne("{{test}} {%partial test%}");

      tmpl.registerPartial("test", combyne("{{test}}", { test: "to you" }));

      var output = tmpl.render({ test: "hello world" });

      assert.equal(output, "hello world to you");
    });

    it("can accept an object to use as context", function() {
      var tmpl = combyne("{{test}} {%partial test prop%}");

      tmpl.registerPartial("test", combyne("{{test}}"));

      var output = tmpl.render({
        test: "hello world",
        prop: {
          test: "to you"
        }
      });

      assert.equal(output, "hello world to you");
    });

    it("can render text with an empty context", function() {
      var tmpl = combyne("{{test}} {%partial test%}");

      tmpl.registerPartial("test", combyne("prop", {}));

      var output = tmpl.render({ test: "hello world" });

      assert.equal(output, "hello world prop");
    });

    it("can handle partials in the middle of templates", function() {
      var tmpl = combyne("{{test}} {%partial test%} 123");

      tmpl.registerPartial("test", combyne("prop", {}));

      var output = tmpl.render({ test: "hello world" });

      assert.equal(output, "hello world prop 123");
    });

    it("will error if invalid tokens are present", function() {
      assert.throws(function() {
        var tmpl = combyne("{%partial 5 > 4%}");
        var output = tmpl.render();
      });
    });

    it("can render with reserved grammar", function() {
      var tmpl = combyne("{{test}} {%partial partials/test%} 123");

      tmpl.registerPartial("partials/test", combyne("prop", {}));

      var output = tmpl.render({ test: "hello world" });

      assert.equal(output, "hello world prop 123");
    });

    describe("Injected partials", function() {
      it("can inject a parent template", function() {
        var tmpl = combyne("{%render layout as content%}{{test}}{%endrender%}");

        tmpl.registerPartial("layout", combyne("<h1>{%partial content%}</h1>"));

        var output = tmpl.render({ test: "hello world" });

        assert.equal(output, "<h1>hello world</h1>");
      });

      it("will error if missing a template name", function() {
        assert.throws(function() {
          var tmpl = combyne("{%render as content%}{{test}}{%endrender%}");
        });
      });

      it("will error if missing a partial name", function() {
        assert.throws(function() {
          var tmpl = combyne("{%render layout%}{{test}}{%endrender%}");
        });
      });
    });
  });
});
