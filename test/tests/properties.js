define(function(require, exports, module) {
  "use strict";

  var combyne = require("lib/index");

  describe("Combyne template's", function() {
    it("can replace a single value", function() {
      var output = combyne("{{test}}", { test: "hello world" }).render();

      expect(output).to.equal("hello world");
    });

    it("can replace many values", function() {
      var output = combyne("{{test}} {{test1}}").render({
        test: "hello world",
        test1: "to you"
      });

      expect(output).to.equal("hello world to you");
    });
  });
});

//exports.propertyReplace = function(test) {
//  // Two replaces
//
//  // Function property
//  var tmpl3 = combyne("{{test}} {{test2}}", { test: "hello world", test2: function() { return "lol"; } });
//  test.equals(tmpl3.render(), "hello world lol", "Two property replaces, but one replace with function property");
//
//  // Null byte
//  var tmpl4 = combyne("{{test}}\00{{test1}}", { test: "hello world", test1: "to you" });
//  test.equals(tmpl4.render(), "hello world\0to you", "Two property replaces divided with null byte");
//
//  // Handling various types of whitespace
//  var tmpl5 = combyne("{{test}}\t{{test1}}\n{{test}}\r{{test1}}\r\n{{test}}   {{test1}}", { test: "hello world", test1: "to you" });
//  test.equals(tmpl5.render(), "hello world\tto you\nhello world\rto you\r\nhello world   to you", "Mutliple replaces separated by various types of whitespace");
//
//  // Unicode support
//  var tmpl6 = combyne("{{test}}", { test: "\u2C64" });
//  test.equals(tmpl6.render(), "\u2C64", "Cool R latin extended unicode support");
//
//  test.done();
//};
//
//exports.objectReplace = function(test) {
//  test.expect(1);
//
//  // Simple object replace
//  var tmpl = combyne("{{test.lol}}", { test: { lol: "hello world" } });
//  test.equals(tmpl.render(), "hello world", "Single object property replace");
//
//  test.done();
//};
//
//})(typeof global !== "undefined" ? global : this);
//
