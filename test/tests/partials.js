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

    it("will report a meaningful error for missing partials", function() {
      try {
        var tmpl = combyne("{%partial name%}");
        var output = tmpl.render();
      }
      catch (ex) {
        assert.equal(ex.message, "Missing partial name");
      }
    });

    it("nested partials are not overwritten by parent", function() {
      var tmpl = combyne("{%partial nested%}");
      var nested = combyne("{%partial correct%}");

      nested.registerPartial("correct", combyne("Correct"));
      tmpl.registerPartial("nested", nested);
      tmpl.registerPartial("correct", combyne("Incorrect"));

      var output = tmpl.render();

      assert.equal(output, "Correct");
    });

    it("nested partials can lookup parent partials", function() {
      var tmpl = combyne("{%partial nested%}");
      var nested = combyne("{%partial correct%}");

      tmpl.registerPartial("nested", nested);
      tmpl.registerPartial("correct", combyne("Correct"));

      var output = tmpl.render();

      assert.equal(output, "Correct");
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

    it("can accept a filtered context object", function() {
      var tmpl = combyne("{{test}} {%partial test prop|append-uncertainty%}");

      tmpl.registerPartial("test", combyne("{{test}}"));

      tmpl.registerFilter("append-uncertainty", function(prop) {
        prop.test += ", perhaps?";
        return prop;
      });

      var output = tmpl.render({
        test: "hello world",
        prop: {
          test: "to you"
        }
      });

      assert.equal(output, "hello world to you, perhaps?");
    });

    it("can be named after a reserved token, like ASSIGN", function() {
      var tmpl = combyne("{{test}} {%partial as .%}");

      tmpl.registerPartial("as", combyne("{{test}}"));

      var output = tmpl.render({
        test: "hello world"
      });

      assert.equal(output, "hello world hello world");
    });

    it("can pass the parent's data", function() {
      var tmpl = combyne("{{test}} {%partial test .%}");

      tmpl.registerPartial("test", combyne("{{test}}"));

      var output = tmpl.render({
        test: "hello world"
      });

      assert.equal(output, "hello world hello world");
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

    it("can render filters within partials", function() {
      var tmpl = combyne("{{test}} {%partial test .%}");

      tmpl.registerPartial("test", combyne("{{test|uppercase}}"));

      tmpl.registerFilter("uppercase", function(prop) {
        return prop.toUpperCase();
      });

      var output = tmpl.render({
        test: "hello world"
      });

      assert.equal(output, "hello world HELLO WORLD");
    });

    it("can render filters from partials, filter registered first", function() {
      var tmpl = combyne("{{test}} {%partial test .%}");

      tmpl.registerFilter("uppercase", function(prop) {
        return prop.toUpperCase();
      });

      tmpl.registerPartial("test", combyne("{{test|uppercase}}"));

      var output = tmpl.render({
        test: "hello world"
      });

      assert.equal(output, "hello world HELLO WORLD");
    });

    it("can nest partials", function() {
      var tmpl = combyne("{%partial test%}");
      var test = combyne("{%partial nested%}", {});

      tmpl.registerPartial("test", test);
      test.registerPartial("nested", combyne("nested", {}));

      var output = tmpl.render();

      assert.equal(output, "nested");
    });

    it("can use a function to provide partial data", function() {
      var tmpl = combyne("{%partial test formatAB 1 2%}");

      tmpl.registerPartial("test", combyne("{{a}} {{b}}", {}));

      var output = tmpl.render({
        formatAB: function(a, b) {
          return { a: a, b: b };
        }
      });

      assert.equal(output, "1 2");
    });

    describe("template inheritance", function() {
      it("can inject a parent template", function() {
        var tmpl = combyne("{%extend layout as content%}{{test}}{%endextend%}");

        tmpl.registerPartial("layout", combyne("<h1>{%partial content%}</h1>"));

        var output = tmpl.render({ test: "hello world" });

        assert.equal(output, "<h1>hello world</h1>");
      });

      it("will error if missing a template name", function() {
        assert.throws(function() {
          var tmpl = combyne("{%extend as content%}{{test}}{%endextend%}");
        });
      });

      it("will error if missing a partial name", function() {
        assert.throws(function() {
          var tmpl = combyne("{%extend layout%}{{test}}{%endextend%}");
        });
      });
    });
  });
});
