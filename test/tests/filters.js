define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../lib/index");

  describe("Filters", function() {
    it("will not function on non filters", function() {
      var tmpl = combyne("|| |    |");
      var output = tmpl.render();

      assert.equal(output, "|| |    |");
    });

    it("will error if invalid filter name is provided", function() {
      assert.throws(function() {
        var tmpl = combyne("{{test|");
        tmpl.registerFilter("filter", function() {});
        var output = tmpl.render();
      });
    });

    it("can execute basic functions", function() {
      var tmpl = combyne("{{test|mod6}}");

      tmpl.registerFilter("mod6", function(value) {
        return value % 6;
      });

      var output = tmpl.render({ test: 15.5 });

      assert.equal(output, "3.5");
    });

    it("can ignore leading whitespace", function() {
      var tmpl = combyne("{{test |mod6}}");

      tmpl.registerFilter("mod6", function(value) {
        return value % 6;
      });

      var output = tmpl.render({ test: 15.5 });

      assert.equal(output, "3.5");
    });

    it("can ignore trailing whitespace", function() {
      var tmpl = combyne("{{test| mod6}}");

      tmpl.registerFilter("mod6", function(value) {
        return value % 6;
      });

      var output = tmpl.render({ test: 15.5 });

      assert.equal(output, "3.5");
    });

    it("can ignore leading and trailing whitespace", function() {
      var tmpl = combyne("{{test| mod6}}");

      tmpl.registerFilter("mod6", function(value) {
        return value % 6;
      });

      var output = tmpl.render({ test: 15.5 });

      assert.equal(output, "3.5");
    });

    it("will work with encoded properties", function() {
      var tmpl = combyne("{{test|number}}");

      tmpl.registerFilter("number", function(value) {
        return Number(value.slice(6));
      });

      var output = tmpl.render({ test: "> 5" });

      assert.equal(output, "5");
    });

    it("will work with raw properties", function() {
      var tmpl = combyne("{{{test|number}}}");

      tmpl.registerFilter("number", function(value) {
        return Number(value.slice(1));
      });

      var output = tmpl.render({ test: "> 5" });

      assert.equal(output, "5");
    });

    it("can execute complex functions", function() {
      var tmpl = combyne("testing this out {{test|reverse}}");

      tmpl.registerFilter("reverse", function(value) {
        return value.split("").reverse().join("");
      });

      var output = tmpl.render({ test: "tart" });

      assert.equal(output, "testing this out trat");
    });

    it("can execute complex functions with arguments", function() {
      var tmpl = combyne("{{test|concat 'lol' 'hi' 'how' 'are' 'you'}}");

      tmpl.registerFilter("concat", function(value) {
        for(var i = 1; i < arguments.length; i++) {
          value += " " + arguments[i];
        }

        return value;
      });

      var output = tmpl.render({ test: "hmm" });

      assert.equal(output, "hmm lol hi how are you");
    });

    it("can execute an object filter", function() {
      var tmpl = combyne("{{test|obj}}");

      tmpl.registerFilter("concat", function(value) {
        for(var i = 1; i < arguments.length; i++) {
          value += " " + arguments[i];
        }

        return value;
      });

      tmpl.registerFilter("obj", function(value) {
        return value["tmp"];
      });

      var output = tmpl.render({ test: { tmp:"test" } });

      assert.equal(output, "test");
    });


    it("support being chained", function() {
      var tmpl = combyne("{{test|addWord 'try'|reverse}}");

      tmpl.registerFilter("addWord", function(val, word) {
        return val + word;
      });

      tmpl.registerFilter("reverse", function(val) {
        return val.split("").reverse().join("");
      });

      var output = tmpl.render({ test: "prop" });

      assert.equal(output, "yrtporp");
    });

    it("supports dots in filter names", function() {
      var tmpl = combyne("{{'test.txt'|removeExt}}");

      tmpl.registerFilter("removeExt", function(val) {
        return val.split(".").slice(0, -1).join(".");
      });

      var output = tmpl.render();

      assert.equal(output, "test");
    });

    it("works with number types", function() {
      var tmpl = combyne("{{test|add 5}}");

      tmpl.registerFilter("add", function(val, num) {
        return val + num;
      });

      var output = tmpl.render({ test: 1 });

      assert.equal(output, "6");
    });

    it("supports filters propagation", function() {
      var tmpl = combyne("{%each item%} {{.|render}} {%endeach%}");

      tmpl.registerFilter("render", function(val) {
        return combyne("Name: {{name}}", { name: val }).render();
      });

      var output = tmpl.render({ item: [ "hi", "you", "own" ] });

      assert.equal(output, " Name: hi  Name: you  Name: own ");
    });

    it("can pass a template value to a filter as an argument", function() {
      var tmpl = combyne("{{test|or test2}}");

      tmpl.registerFilter("or", function(value, arg) {
        return value || arg;
      });

      var output = tmpl.render({ test: false, test2: "hello" });

      assert.equal(output, "hello");
    });

    it("can chain filters within a conditional", function() {
      var tmpl = combyne("{%if false%}test{%else%}{{test|addWord 'try'|reverse}}{%endif%}");

      tmpl.registerFilter("addWord", function(val, word) {
        return val + word;
      });

      tmpl.registerFilter("reverse", function(val) {
        return val.split("").reverse().join("");
      });

      var output = tmpl.render({ test: "prop" });

      assert.equal(output, "yrtporp");
    });
  });
});
