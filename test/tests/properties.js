define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../lib/index");

  describe("Properties", function() {
    it("can replace a single value", function() {
      var output = combyne("{{test}}", { test: "hello world" }).render();

      assert.equal(output, "hello world");
    });

    it("ignores whitespace between the delimiters", function() {
      var output = combyne("{{ test       }}").render({ test: "hello world" });

      assert.equal(output, "hello world");
    });

    it("will error if the property delimiter is unterminated", function() {
      assert.throws(function() {
        combyne("{{ test").render({ test: "hello world" })
      });
    });

    it("can process raw nested properties", function() {
      var output = combyne("{{{nested.property}}}").render({
        nested: {
          property: "test"
        }
      });

      assert.equal(output, "test");
    });

    it("does not print undefined properties", function() {
      var output = combyne("{{{nested.property}}}").render({
        nested: {
          property: undefined
        }
      });

      assert.equal(output, "");
    });

    it("can replace many values", function() {
      var output = combyne("{{test}} {{test1}}").render({
        test: "hello world",
        test1: "to you"
      });

      assert.equal(output, "hello world to you");
    });

    it("can replace function invocations", function() {
      var output = combyne("{{test}} {{test2}}").render({
        test: "hello world",
        test2: function() {
          return "lol";
        }
      });

      assert.equal(output, "hello world lol");
    });

    it("can handle various types of whitespace", function() {
      var output = combyne("test\ttest\ntest\rtest\r\ntest   test").render();

      assert.equal(output, "test\ttest\ntest\rtest\r\ntest   test");
    });

    it("does not lose data with encoding", function() {
      var tmpl = combyne("{{test}}");
      var output = tmpl.render({ test: "\u1D306" });

      assert.equal(output, "\u1D306");
    });

    it("can handle unicode characters", function() {
      var tmpl = combyne("{{{test}}}");
      var output = tmpl.render({ test: "\u2C64" });

      assert.equal(output, "\u2C64");
    });

    it("can do a simple object replace", function() {
      var output = combyne("{{test.prop}}").render({
        test: {
          prop: "hello world"
        }
      });

      assert.equal(output, "hello world");
    });

    it("can do dot notation that is invalid JavaScript", function() {
      var output = combyne("{{test-that.prop}}").render({
        "test-that": {
          prop: "hello world"
        }
      });

      assert.equal(output, "hello world");
    });

    it("can call a function and pass an argument", function() {
      var output = combyne("{{test.toUpper 'test'}}").render({
        test: {
          toUpper: function(val) {
            return val.toUpperCase();
          }
        }
      });

      assert.equal(output, "TEST");
    });

    it("will not fail on leading whitespace", function( ){
      var tmpl = combyne("{{ test.property|replace '**' '*'}}");

      tmpl.registerFilter("replace", function(val, arg1, arg2) {
        return val.replace(arg1, arg2);
      });

      var output = tmpl.render({
        test: {
          property: "***"
        }
      });

      assert.equal(output, "**");
    });

    it("does not display undefined for missing values", function() {
      var tmpl = combyne("{{ undefinedValue}}");

      var output = tmpl.render({
        undefinedValue: undefined
      });

      assert.equal(output, "");
    });
  });
});
