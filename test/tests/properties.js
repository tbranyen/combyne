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

    it("can work with null bytes", function() {
      var output = combyne("{{test}}\0{{test1}}").render({
        test: "hello world",
        test1: "to you" 
      });

      assert.equal(output, "hello world\0to you");
    });

    it("can handle various types of whitespace", function() {
      var output = combyne("test\ttest\ntest\rtest\r\ntest   test").render();

      assert.equal(output, "test\ttest\ntest\rtest\r\ntest   test");
    });

    it("can handle unicode characters", function() {
      var output = combyne("{{test}}").render({ test: "\u2C64" });

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
  });
});
