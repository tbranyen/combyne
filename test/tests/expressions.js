define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../lib/index");

  describe("Expressions", function() {
    it("can support whitespace", function() {
      var tmpl = combyne("{%    if test  %}hello world{%  endif%}");
      var output = tmpl.render({ test: true })

      expect(output).to.equal("hello world");
    });

    it("will error when invalid expressions are used", function() {
      expect(function() {
        var tmpl = combyne("{%error%}{%error%}");
        var output = tmpl.render();
      }).to.throw(Error);
    });

    describe("if statement", function() {
      it("must have at least one condition", function() {
        expect(function() {
          var tmpl = combyne("{%if%}{%endif%}");
          var output = tmpl.render();
        }).to.throw(Error);
      });

      it("can evaluate basic truthy", function() {
        var tmpl = combyne("{%if test%}hello world{%endif%}");
        var output = tmpl.render({ test: true })

        expect(output).to.equal("hello world");
      });

      it("can compare numbers", function() {
        var tmpl = combyne("{%if 5==test%}hello world{%endif%}");
        var output = tmpl.render({ test: 5 })

        expect(output).to.equal("hello world");
      });

      it("can compare equal booleans", function() {
        var tmpl = combyne("{%if false==test%}hello world{%endif%}");
        var output = tmpl.render({ test: false })

        expect(output).to.equal("hello world");
      });

      it("can evaluate basic falsy", function() {
        var tmpl = combyne("{%if test%}hello world{%endif%}");
        var output = tmpl.render({ test: false });

        expect(output).to.equal("");
      });

      it("can evaluate missing properties", function() {
        var tmpl = combyne("{%if test%}hello world{%endif%}");
        var output = tmpl.render({});

        expect(output).to.equal("");
      });

      it("can evaluate nested truthy conditionals", function() {
        var tmpl = combyne("{%if test%}{%if hi%}hello{%endif%}{%endif%}");
        var output = tmpl.render({ test: true, hi: true });

        expect(output).to.equal("hello");
      });

      it("can evaluate nested conditionals with falsy root value", function() {
        var tmpl = combyne("{%if test%}{%if hi%}hello{%endif%}{%endif%}");
        var output = tmpl.render({ test: false, hi: true });

        expect(output).to.equal("");
      });

      it("can evaluate nested if statement with falsy values", function() {
        var tmpl = combyne("{%if test%}{%if hi%}hello{%endif%}{%endif%}");
        var output = tmpl.render({ test: false, hi: false });

        expect(output).to.equal("");
      });

      it("can evaluate truthy dot notation", function() {
        var tmpl = combyne("{%if test.prop%}hello{%endif%}");
        var output = tmpl.render({ test: { prop: true } });

        expect(output).to.equal("hello");
      });

      it("can evaluate falsy dot notation", function() {
        var tmpl = combyne("{%if test.prop%}hello{%endif%}");
        var output = tmpl.render({ test: { prop: false } });

        expect(output).to.equal("");
      });

      it("can evaluate truthy deep dot notation", function() {
        var tmpl = combyne("{%if test.prop.hi%}hello{%endif%}");
        var output = tmpl.render({ test: { prop: { hi: true } } });

        expect(output).to.equal("hello");
      });

      it("can evaluate falsy deep dot notation", function() {
        var tmpl = combyne("{%if test.prop.hi%}hello{%endif%}");
        var output = tmpl.render({ test: { prop: { hi: false } } });

        expect(output).to.equal("");
      });

      it("can evaluate not conditional with falsy value", function() {
        var tmpl = combyne("{%if not test%}hello{%endif%}");
        var output = tmpl.render({ test: false });

        expect(output).to.equal("hello");
      });

      it("can evaluate not conditional with truthy value", function() {
        var tmpl = combyne("{%if not test%}hello{%endif%}");
        var output = tmpl.render({ test: true });

        expect(output).to.equal("");
      });

      it("can evaluate conditional truthy string values", function() {
        var tmpl = combyne("{%if 'test' == 'test'%}hello{%endif%}");
        var output = tmpl.render();

        expect(output).to.equal("hello");
      });

      it("can evaluate conditional falsy string values", function() {
        var tmpl = combyne("{%if 'test' != 'test'%}hello{%endif%}");
        var output = tmpl.render();

        expect(output).to.equal("");
      });

      it("can evaluate numerical greater than", function() {
        var tmpl = combyne("{%if 5 > 4%}hello{%endif%}");
        var output = tmpl.render();

        expect(output).to.equal("hello");
      });

      it("can evaluate numerical greater than or equal", function() {
        var tmpl = combyne("{%if 5 >= 4%}hello{%endif%}");
        var output = tmpl.render();

        expect(output).to.equal("hello");
      });

      it("can evaluate numerical less than", function() {
        var tmpl = combyne("{%if 4 < 5%}hello{%endif%}");
        var output = tmpl.render();

        expect(output).to.equal("hello");
      });

      it("can evaluate numerical less than or equal", function() {
        var tmpl = combyne("{%if 4 <= 5%}hello{%endif%}");
        var output = tmpl.render();

        expect(output).to.equal("hello");
      });
    });

    describe("else statement", function() {
      it("is supported", function() {
        var tmpl = combyne("{%if test%}hello{%else%}goodbye{%endif%} world");
        var output = tmpl.render({ test: false });

        expect(output).to.equal("goodbye world");
      });

      it("can evaluate nested with truthy root", function() {
        var tmpl = combyne("{%if test%}{%if hello%}hello{%else%}goodbye{%endif%}{%endif%}");
        var output = tmpl.render({ test: true, hello: true });

        expect(output).to.equal("hello");
      });

      it("can evaluate nested with falsy root", function() {
        var tmpl = combyne("{%if test%}{%if hello%}hello{%else%}goodbye{%endif%}{%endif%}");
        var output = tmpl.render({ test: false, hello: true });

        expect(output).to.equal("");
      });

      it("can evaluate nested with falsy nested", function() {
        var tmpl = combyne("{%if test%}{%if hello%}hello{%else%}goodbye{%endif%}{%endif%}");
        var output = tmpl.render({ test: true, hello: false });

        expect(output).to.equal("goodbye");
      });

      it("can evaluate nested if with an else", function() {
        var tmpl = combyne("{%if test%}{%if hello%}hello{%endif%} {%else%}goodbye{%endif%}");
        var output = tmpl.render({ test: true, hello: true });

        expect(output).to.equal("hello ");
      });
    });

    describe("elsif statement", function() {
      it("is supported", function() {
        var tmpl = combyne("{%if test%}good{%elsif not test%}bad{%endif%}");
        var output = tmpl.render({ test: false });

        expect(output).to.equal("bad");
      });
    });

    describe("array loop", function() {
      it("can iterate a simple array", function() {
        var tmpl = combyne("{%each test%}hello{%endeach%}");
        var output = tmpl.render({ test: new Array(5) });

        expect(output).to.equal("hellohellohellohellohello");
      });

      it("can iterate a moderately complicated with filter", function() {
        var tmpl = combyne("{%each prop%}{{i|toString}} {{.}}{%endeach%}");

        tmpl.registerFilter("toString", function(val) {
          return "Index at: " + val.toString() + ", ";
        });

        var output = tmpl.render({
          prop: [
            "1", 
            "true", 
            31,

            function() {
              return "prop";
            },

            5
          ]
        });

        expect(output).to.equal("Index at: 0,  1Index at: 1,  trueIndex at: 2,  31Index at: 3,  propIndex at: 4,  5");
      });

      it("can have exist before iteration", function() {
        var tmpl = combyne("test {%each prop%}{{.}}{%endeach%}");
        var output = tmpl.render({ prop: [5] });

        expect(output).to.equal("test 5");
      });

      it("can have it's delimiter changed", function() {
        // Change delimiter
        var tmpl = combyne("{%each prop as _%}{{_}}{%endeach%}");
        var output = tmpl.render({ prop: [1,2,3] });

        expect(output).to.equal("123");
      });

      it("can handle a complicated nested loop", function() {
        var tmpl = combyne("{%each lol%}{%each lol2%}{{.}}{%endeach%}{%endeach%}");
        var output = tmpl.render({ lol: [1,2,3], lol2: [3,2,1] });

        expect(output).to.equal("321321321");
      });

      it("can loop an array of objects", function() {
        //var tmpl = combyne("{%each lol%}{{key}}{%endeach%}");
        //var output = tmpl.render({ lol: [{key:"value"}] });

        //expect(output).to.equal("value");
      });
    });

    describe("object loop", function() {
      it("can iterate", function() {
        var tmpl = combyne("{%each demo as v k%}{{k}}:{{v}} {%endeach%}");

        var output = tmpl.render({
          demo: {
            lol: "hi",
            you: "me?",
            what: "test"
          }
        });

        expect(output).to.equal("lol:hi you:me? what:test ");
      });

      it("will ignore properties on the prototype", function() {
        var tmpl = combyne("{%each demo as v k%}{{k}}:{{v}} {%endeach%}");

        var context = {
          demo: {
            lol: "hi",
            you: "me?",
            what: "test"
          }
        };

        context.demo.__proto__.me = "break";

        var output = tmpl.render(context);

        expect(output).to.equal("lol:hi you:me? what:test ");
      });

      it("can loop over the object keys", function() {
        var tmpl = combyne("{%each demo as val key%}{{key}}{%endeach%}");
        var output = tmpl.render({
          demo: { lol: "hi", you: "me?", what: "test" }
        });

        expect(output).to.equal("lolyouwhat");
      });

      /*
  // Each loop over object do nothing, should not do anything
  var tmpl3 = combyne("{%each demo%}key{%endeach%}", { demo: { lol: "hi", you: "me?", what: "test" } });
  test.equals( tmpl3.render(), "keykeykey", "Loop over an object" );

  // Each loop over object repeat property, 
  var tmpl4 = combyne("{%each demo%}{{demo.lol}}{%endeach%}", { demo: { lol: "hi", you: "me?", what: "test" } });
  test.equals( tmpl4.render(), "hihihi", "Loop over an object" );

  // Each loop over object repeat property function
  var tmpl5 = combyne("{%each demo%}{{demo.lol}}{%endeach%}", { demo: { lol: function() {
    return "hi"; 
  }, you: "me?", what: "test" } });
  test.equals( tmpl5.render(), "hihihi", "Loop over an object property function" );

  // Each loop over object repeat property function with filter
  var tmpl6 = combyne("{%each demo%}{{demo.lol|reverse}}{%endeach%}", { demo: { lol: function() {
    return "hi"; 
  }, you: "me?", what: "test" } });
  tmpl6.filters.add("reverse", function( val ) {
    return Array.prototype.slice.call(val).reverse().join("");
  });
  test.equals( tmpl6.render(), "ihihih", "Loop over an object property function and apply reverse filter" );

  */
    });
  });
});

/*
exports.nestedIfStatements = function( test ) {
  test.expect(3);

  // Nested not if, falsly value
  var tmpl = combyne("{%if not test%}hello{%if test%}goodbye{%endif%}{%endif%}", { test: false });
  test.equals( tmpl.render(), "hello", "Testing nested not conditional with falsy value" );

  // Nested not if, truthy value
  var tmpl2 = combyne("{%if not test%}hello{%if test%}goodbye{%endif%}{%endif%}", { test: true });
  test.equals( tmpl2.render(), "", "Testing nested not conditional with truthy value" );

  // Testing two truthy nested values
  var tmpl3 = combyne("{%if test%}hello{%if hi%}goodbye{%endif%}{%endif%}", { test: true, hi: true });
  test.equals( tmpl3.render(), "hellogoodbye", "Testing truthy nested conditionals" );

  test.done();
};

exports.eachLoopConditional = function( test ) {
  test.expect(3);

  // Conditional in each loop using no context
  var tmpl = combyne("{%each demo%}{%if "lol" == "lol"%}test{%endif%}{%endeach%}", { demo: [ 1, 2, 3 ] });
  test.equals( tmpl.render(), "testtesttest", "Conditional in each loop using no context" );

  // Conditional in each loop using original context
  var tmpl2 = combyne("{%each demo%}{%if test == "lol"%}{{val}}{%endif%}{%endeach%}", { test: "lol", val: "hi", demo: [ 1, 2, 3 ] });
  test.equals( tmpl2.render(), "hihihi", "Conditional in each loop using original context" );

  // Conditional in each loop using loop context
  var tmpl3 = combyne("{%each demo as key val%}{%if key == "lol"%}{{val}}{%endif%}{%endeach%}", { demo: { lol: "hi", you: "me?", what: "test" } });
  test.equals( tmpl3.render(), "hi", "Conditional in each loop using loop context" );

  test.done();
};

exports.nestedEachLoopConditional = function( test ) {
  test.expect(2);

  // Conditional in each loop using no context
  var tmpl = combyne("{%each demo%}{%each demo2%}{%if "lol" == "lol"%}test{%endif%}{%endeach%}{%endeach%}", { demo: [ 1, 2, 3 ], demo2: [1] });
  test.equals( tmpl.render(), "testtesttest", "Conditional in each loop using no context" );

  // Conditional in each loop using original context
  var tmpl2 = combyne("{%each demo%}{%each demo2%}{%if test == "lol"%}{{val}}{%endif%}{%endeach%}{%endeach%}", { test: "lol", val: "hi", demo: [ 1, 2, 3 ], demo2: [1] });
  test.equals( tmpl2.render(), "hihihi", "Conditional in each loop using original context" );

  test.done();
};

exports.nestedIfElseInsideEachLoopConditional = function( test ) {
  test.expect(1);

  // Conditional in each loop using no context
  var tmpl = combyne("{%each demo as i%}{%if i == 1"%}test{%else%}{{i}}{%endif%}{%endeach%}", { demo: [ 1, 2, 3 ], demo2: [1] });
  test.equals( tmpl.render(), "test23", "Conditional if/else in each loop" );

  test.done();
};
*/
