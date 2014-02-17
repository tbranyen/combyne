define(function(require, exports, module) {
  "use strict";

  var combyne = require("lib/index");

  describe("Filters", function() {
    it("will not function on non filters", function() {
      var tmpl = combyne("|| |    |");
      var output = tmpl.render();

      expect(output).to.equal("|| |    |");
    });

    it("can execute basic functions", function() {
      var tmpl = combyne("{{test|mod6}}");

      tmpl.registerFilter("mod6", function(value) {
        return value % 6;
      });

      var output = tmpl.render({ test: 15.5 });

      expect(output).to.equal("3.5");
    });

    it("can execute complex functions", function() {
      var tmpl = combyne("testing this out {{test|reverse}}");

      tmpl.registerFilter("reverse", function(value) {
        return Array.prototype.slice.call(value).reverse().join("");
      });

      var output = tmpl.render({ test: "tart" });

      expect(output).to.equal("testing this out trat");
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

      expect(output).to.equal("hmm lol hi how are you");
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

      expect(output).to.equal("test");
    });
  });
});

/*
exports.chainedFilters = function( test ) {
  test.expect(1);

  // Basic chainable functions
  var tmpl = combyne("{{test|addWord "fart"|reverse}}", { test: "hi" });
  tmpl.filters.add("addWord", function( val, word ) {
    return val + word;
  });
  tmpl.filters.add("reverse", function( val ) {
    return Array.prototype.slice.call(val).reverse().join("");
  });
  test.equals( tmpl.render(), "trafih", "Basic chainable functions" );

  test.done();
};

exports.typedFilters = function( test ) {
  test.expect(1);

  // Basic chainable functions
  var tmpl = combyne("{{test|add 5}}", { test: 1 });
  tmpl.filters.add("add", function( val, num ) {
    return val + num;
  });
  test.equals( tmpl.render(), "6", "Work with number types" );

  test.done();
};

exports.nestedFilters = function( test ) {
  test.expect(1);

  var obj = { item: [ "hi", "you", "own" ] };
  var tmpl = combyne("{%each item%} {{.|render}} {%endeach%}", obj);

  tmpl.filters.add("render", function(val) {
    return combyne("Name: {{name}}", { name: val }).render();
  });

  test.equals( tmpl.render(), " Name: hi  Name: you  Name: own ", "Render templates inside filters" );

  test.done();
};
*/

