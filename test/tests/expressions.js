define(function(require, exports, module) {
  "use strict";

  var combyne = require("../../lib/index");
  var createObject = require("../../lib/utils/create_object");

  describe("Expressions", function() {
    it("can support whitespace", function() {
      var tmpl = combyne("{%    if test  %}hello world{%  endif%}");
      var output = tmpl.render({ test: true })

      assert.equal(output, "hello world");
    });

    it("will error when invalid expressions are used", function() {
      assert.throws(function() {
        var tmpl = combyne("{%error%}{%error%}");
        var output = tmpl.render();
      });
    });

    describe("if statement", function() {
      it("must have at least one condition", function() {
        assert.throws(function() {
          combyne("{%if%}{%endif%}");
        });
      });

      it("will report the correct error for missing conditions", function() {
        try {
          combyne("{%if%}{%endif%}");
        }
        catch (ex) {
          assert.equal(ex.message, "Missing conditions to if statement");
        }
      });

      it("can contain an empty body", function() {
        var tmpl = combyne("{%if true%}{%endif%}");
        var output = tmpl.render()

        assert.equal(output, "");
      });

      it("can evaluate basic truthy", function() {
        var tmpl = combyne("{%if test%}hello world{%endif%}");
        var output = tmpl.render({ test: true })

        assert.equal(output, "hello world");
      });

      it("can compare numbers", function() {
        var tmpl = combyne("{%if 5==test%}hello world{%endif%}");
        var output = tmpl.render({ test: 5 })

        assert.equal(output, "hello world");
      });

      it("can compare equal booleans", function() {
        var tmpl = combyne("{%if false==test%}hello world{%endif%}");
        var output = tmpl.render({ test: false })

        assert.equal(output, "hello world");
      });

      it("can evaluate basic falsy", function() {
        var tmpl = combyne("{%if test%}hello world{%endif%}");
        var output = tmpl.render({ test: false });

        assert.equal(output, "");
      });

      it("can evaluate missing properties", function() {
        var tmpl = combyne("{%if test%}hello world{%endif%}");
        var output = tmpl.render({});

        assert.equal(output, "");
      });

      it("can evaluate nested truthy conditionals", function() {
        var tmpl = combyne("{%if test%}{%if hi%}hello{%endif%}{%endif%}");
        var output = tmpl.render({ test: true, hi: true });

        assert.equal(output, "hello");
      });

      it("can evaluate nested conditionals with falsy root value", function() {
        var tmpl = combyne("{%if test%}{%if hi%}hello{%endif%}{%endif%}");
        var output = tmpl.render({ test: false, hi: true });

        assert.equal(output, "");
      });

      it("can evaluate nested if statement with falsy values", function() {
        var tmpl = combyne("{%if test%}{%if hi%}hello{%endif%}{%endif%}");
        var output = tmpl.render({ test: false, hi: false });

        assert.equal(output, "");
      });

      it("can evaluate truthy dot notation", function() {
        var tmpl = combyne("{%if test.prop%}hello{%endif%}");
        var output = tmpl.render({ test: { prop: true } });

        assert.equal(output, "hello");
      });

      it("can evaluate falsy dot notation", function() {
        var tmpl = combyne("{%if test.prop%}hello{%endif%}");
        var output = tmpl.render({ test: { prop: false } });

        assert.equal(output, "");
      });

      it("can evaluate truthy deep dot notation", function() {
        var tmpl = combyne("{%if test.prop.hi%}hello{%endif%}");
        var output = tmpl.render({ test: { prop: { hi: true } } });

        assert.equal(output, "hello");
      });

      it("can evaluate falsy deep dot notation", function() {
        var tmpl = combyne("{%if test.prop.hi%}hello{%endif%}");
        var output = tmpl.render({ test: { prop: { hi: false } } });

        assert.equal(output, "");
      });

      it("can evaluate not conditional with falsy value", function() {
        var tmpl = combyne("{%if not test%}hello{%endif%}");
        var output = tmpl.render({ test: false });

        assert.equal(output, "hello");
      });

      it("can evaluate not conditional with truthy value", function() {
        var tmpl = combyne("{%if not test%}hello{%endif%}");
        var output = tmpl.render({ test: true });

        assert.equal(output, "");
      });

      it("can evaluate conditional truthy string values", function() {
        var tmpl = combyne("{%if 'test' == 'test'%}hello{%endif%}");
        var output = tmpl.render();

        assert.equal(output, "hello");
      });

      it("can evaluate conditional falsy string values", function() {
        var tmpl = combyne("{%if 'test' != 'test'%}hello{%endif%}");
        var output = tmpl.render();

        assert.equal(output, "");
      });

      it("can evaluate numerical greater than", function() {
        var tmpl = combyne("{%if 5 > 4%}hello{%endif%}");
        var output = tmpl.render();

        assert.equal(output, "hello");
      });

      it("can evaluate numerical greater than or equal", function() {
        var tmpl = combyne("{%if 5 >= 4%}hello{%endif%}");
        var output = tmpl.render();

        assert.equal(output, "hello");
      });

      it("can evaluate numerical less than", function() {
        var tmpl = combyne("{%if 4 < 5%}hello{%endif%}");
        var output = tmpl.render();

        assert.equal(output, "hello");
      });

      it("can evaluate numerical less than or equal", function() {
        var tmpl = combyne("{%if 4 <= 5%}hello{%endif%}");
        var output = tmpl.render();

        assert.equal(output, "hello");
      });

      it("can evaluate strings containing reserved words", function() {
        var tmpl = combyne("{%if hello == 'helloif'%}hello{%endif%}");
        var output = tmpl.render({ hello: "helloif" });

        assert.equal(output, "hello");
      });

      it("can evaluate statements with filters", function () {
        var tmpl = combyne("{%if hello|upper == 'HELLO'%}hello{%endif%}");

        tmpl.registerFilter("upper", function(value) {
          return value.toUpperCase();
        });

        var output = tmpl.render({ hello: "hello"});
        assert.equal(output, "hello");
      });

      it("can evaluate root with filters", function () {
        var tmpl = combyne("{%if |upper == 'HELLO'%}hello{%endif%}");

        tmpl.registerFilter("upper", function(value) {
          return value.toUpperCase();
        });

        var output = tmpl.render("hello");
        assert.equal(output, "hello");
      });

      it("can evaluate root referenced by '.' with filters", function () {
        var tmpl = combyne("{%if .|upper == 'HELLO'%}hello{%endif%}");

        tmpl.registerFilter("upper", function(value) {
          return value.toUpperCase();
        });

        var output = tmpl.render("hello");
        assert.equal(output, "hello");
      });

      it("can evaluate statements with filters and parameters", function () {
        var tmpl = combyne("{%if hello|replace 'ello' 'ola' == 'hola'%}hello{%endif%}");

        tmpl.registerFilter("replace", function(value, replaceThis, withThat) {
          return value.replace(replaceThis, withThat);
        });

        var output = tmpl.render({ hello: "hello"});
        assert.equal(output, "hello");
      });

      it("can evaluate statements with nested filters", function () {
        var tmpl = combyne("{%if hello|upper|reverse == 'OLLEH'%}hello{%endif%}");

        tmpl.registerFilter("upper", function(value) {
          return value.toUpperCase();
        });

        tmpl.registerFilter("reverse", function(value) {
          return value.split("").reverse().join("");
        });

        var output = tmpl.render({ hello: "hello"});
        assert.equal(output, "hello");
      });

      it("can evaluate statements with explicitly declared properties", function () {
        var tmpl = combyne("{%if {{hello}} == 'hello'%}hello{%endif%}");

        var output = tmpl.render({ hello: "hello"});
        assert.equal(output, "hello");
      });

      it("can evaluate statements with explicitly declared properties with filters", function () {
        var tmpl = combyne("{%if {{hello|upper|reverse}} == 'OLLEH'%}hello{%endif%}");

        tmpl.registerFilter("upper", function(value) {
          return value.toUpperCase();
        });

        tmpl.registerFilter("reverse", function(value) {
          return value.split("").reverse().join("");
        });

        var output = tmpl.render({ hello: "hello"});
        assert.equal(output, "hello");
      });

      it("can evaluate statements with raw properties", function () {
        var tmpl = combyne("{%if {{{hello}}} == '<>'%}hello{%endif%}");

        var output = tmpl.render({ hello: "<>"});
        assert.equal(output, "hello");
      });
    });

    describe("else statement", function() {
      it("is supported", function() {
        var tmpl = combyne("{%if test%}hello{%else%}goodbye{%endif%} world");
        var output = tmpl.render({ test: false });

        assert.equal(output, "goodbye world");
      });

      it("can evaluate nested with truthy root", function() {
        var tmpl = combyne("{%if test%}{%if hello%}hello{%else%}goodbye{%endif%}{%endif%}");
        var output = tmpl.render({ test: true, hello: true });

        assert.equal(output, "hello");
      });

      it("can evaluate nested with falsy root", function() {
        var tmpl = combyne("{%if test%}{%if hello%}hello{%else%}goodbye{%endif%}{%endif%}");
        var output = tmpl.render({ test: false, hello: true });

        assert.equal(output, "");
      });

      it("can evaluate nested with falsy nested", function() {
        var tmpl = combyne("{%if test%}{%if hello%}hello{%else%}goodbye{%endif%}{%endif%}");
        var output = tmpl.render({ test: true, hello: false });

        assert.equal(output, "goodbye");
      });

      it("can evaluate nested if with an else", function() {
        var tmpl = combyne("{%if test%}{%if hello%}hello{%endif%} {%else%}goodbye{%endif%}");
        var output = tmpl.render({ test: true, hello: true });

        assert.equal(output, "hello ");
      });
    });

    describe("elsif statement", function() {
      it("is supported", function() {
        var tmpl = combyne("{%if test%}good{%elsif not test%}bad{%endif%} test");
        var output = tmpl.render({ test: false });

        assert.equal(output, "bad test");
      });
    });

    describe("nested if statement", function() {
      it("can evaluate nested not if with falsly value", function() {
        var tmpl = combyne("{%if not test%}hello{%if test%}goodbye{%endif%}{%endif%}");
        var output = tmpl.render({ test: false });

        assert.equal(output, "hello");
      });

      it("can evaluate nested not if with truthy value", function() {
        var tmpl = combyne("{%if not test%}hello{%if test%}goodbye{%endif%}{%endif%}");
        var output = tmpl.render({ test: true });

        assert.equal(output, "");
      });

      it("can evaluate two truthy nested values", function() {
        var tmpl = combyne("{%if test%}hello{%if hi%}goodbye{%endif%}{%endif%}");
        var output = tmpl.render({ test: true, hi: true });

        assert.equal(output, "hellogoodbye");
      });
    });

    describe("array loop", function() {
      it("can iterate a simple array", function() {
        var tmpl = combyne("{%each test%}hello{%endeach%}");
        var output = tmpl.render({ test: [1, 2, 3, 4, 5] });

        assert.equal(output, "hellohellohellohellohello");
      });

      it("can iterate a simple array on root", function() {
        var tmpl = combyne("{%each%}hello{%endeach%}");
        var output = tmpl.render([1, 2, 3, 4, 5]);

        assert.equal(output, "hellohellohellohellohello");
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

        assert.equal(output, "Index at: 0,  1Index at: 1,  trueIndex at: 2,  31Index at: 3,  propIndex at: 4,  5");
      });

      it("can have exist before iteration", function() {
        var tmpl = combyne("test {%each prop%}{{.}}{%endeach%}");
        var output = tmpl.render({ prop: [5] });

        assert.equal(output, "test 5");
      });

      it("can have it's delimiter changed", function() {
        // Change delimiter
        var tmpl = combyne("{%each prop as _%}{{_}}{%endeach%}");
        var output = tmpl.render({ prop: [1,2,3] });

        assert.equal(output, "123");
      });

      it("can handle a complicated nested loop", function() {
        var tmpl = combyne("{%each lol%}{%each lol2%}{{.}}{%endeach%}{%endeach%}");
        var output = tmpl.render({ lol: [1,2,3], lol2: [3,2,1] });

        assert.equal(output, "321321321");
      });

      it("can loop an array of objects", function() {
        var tmpl = combyne("{%each lol as _%}{{_.key}}{%endeach%}");
        var output = tmpl.render({ lol: [{key:"value"}] });

        assert.equal(output, "value");
      });

      it("can scope lookups to context object", function() {
        var tmpl = combyne("{%each%}{{key}}{%endeach%}");
        var output = tmpl.render([{key:"value"}]);

        assert.equal(output, "value");
      });

      it("can handle nested properties with loops", function() {
        var template = combyne("{%each header.css as val key%}{{val}}{%endeach%}");
        var data = {
          header: {
            css: ["header.css"]
          }
        };

        var output = template.render(data);

        assert.equal(output, "header.css");
      });

      it("can loop over a property called through a filter", function() {
        var tmpl = combyne("{%each hello|upper%}{{.}}{%endeach%}");

        tmpl.registerFilter("upper", function(array) {
          return array.map(function (entry) {
            return entry.toUpperCase();
          });
        });

        var output = tmpl.render({
          hello: [
            "hola",
            "hallo",
            "hello",
            "bonjour",
            "ahoj"
          ]
        });

        assert.equal(output, "HOLAHALLOHELLOBONJOURAHOJ");
      });

      it("can loop over a property called through a filter with a parameter", function() {
        var tmpl = combyne("{%each hello|case true %}{{.}}{%endeach%}{%each hello|case false %}{{.}}{%endeach%}");

        tmpl.registerFilter("case", function(array, toUpperCase) {
          return array.map(function(entry) {
            return toUpperCase ? entry.toUpperCase() : entry.toLowerCase();
          });
        });

        var output = tmpl.render({
          hello: [
            "Hola",
            "Hallo",
            "Hello",
            "bonjour",
            "ahoj"
          ]
        });

        assert.equal(output, "HOLAHALLOHELLOBONJOURAHOJholahallohellobonjourahoj");
      });

      it("can loop over the root called through a filter", function() {
        var tmpl = combyne("{%each |upper%}{{.}}{%endeach%}");

        tmpl.registerFilter("upper", function(array) {
          return array.map(function (entry) {
            return entry.toUpperCase();
          });
        });

        var output = tmpl.render([
            "hola",
            "hallo",
            "hello",
            "bonjour",
            "ahoj"
          ]);

        assert.equal(output, "HOLAHALLOHELLOBONJOURAHOJ");
      });

      it("can loop over the root", function() {
        var tmpl = combyne("{%each%}{{.}}{%endeach%}");

        var output = tmpl.render({ "hi": "how are ya?" });

        assert.equal(output, "how are ya?");
      });

      it("can loop over the root as '.' called through a filter", function() {
        var tmpl = combyne("{%each .|upper%}{{.}}{%endeach%}");

        tmpl.registerFilter("upper", function(array) {
          return array.map(function (entry) {
            return entry.toUpperCase();
          });
        });

        var output = tmpl.render([
            "hola",
            "hallo",
            "hello",
            "bonjour",
            "ahoj"
          ]);

        assert.equal(output, "HOLAHALLOHELLOBONJOURAHOJ");
      });

      it("can loop over a property called through a filter and assigned a new iterator name", function() {
        var tmpl = combyne("{%each hello|upper as val%}{{val}}{%endeach%}");

        tmpl.registerFilter("upper", function(array) {
          return array.map(function (entry) {
            return entry.toUpperCase();
          });
        });

        var output = tmpl.render({
          hello: [
            "hola",
            "hallo",
            "hello",
            "bonjour",
            "ahoj"
          ]
        });

        assert.equal(output, "HOLAHALLOHELLOBONJOURAHOJ");
      });

      it("can loop over a property called through many filters", function() {
        var tmpl = combyne("{%each hello|upper|trim%}{{.}}{%endeach%}");

        tmpl.registerFilter("upper", function(array) {
          return array.map(function (entry) {
            return entry.toUpperCase();
          });
        });

        tmpl.registerFilter("trim", function(array) {
          return array.map(function (entry) {
            return entry.trim();
          });
        });

        var output = tmpl.render({
          hello: [
            "  hola  ",
            " hallo ",
            "hello ",
            " bonjour",
            "ahoj"
          ]
        });

        assert.equal(output, "HOLAHALLOHELLOBONJOURAHOJ");
      });

      it("can loop over a property called through a filter and each item called through a filter", function() {
        var tmpl = combyne("{%each hello|upper%}{{.|reverse}}{%endeach%}");

        tmpl.registerFilter("upper", function(array) {
          return array.map(function (entry) {
            return entry.toUpperCase();
          });
        });

        tmpl.registerFilter("reverse", function(value) {
          return value.split("").reverse().join("");
        });

        var output = tmpl.render({
          hello: [
            "hola",
            "hallo",
            "hello",
            "bonjour",
            "ahoj"
          ]
        });

        assert.equal(output, "ALOHOLLAHOLLEHRUOJNOBJOHA");
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

        assert.equal(output, "lol:hi you:me? what:test ");
      });

      it("can use database as a value name", function() {
        var tmpl = combyne("{%each databases as database name%}{{name}}:{{database}}{%endeach%}");

        var output = tmpl.render({
          databases: {
            database1: "online"
          }
        });

        assert.equal(output, "database1:online");
      });

      it("will ignore properties on the prototype", function() {
        var tmpl = combyne("{%each demo as v k%}{{k}}:{{v}} {%endeach%}");

        var context = {
          demo: createObject({ me: "break" })
        };

        context.demo.lol = "hi";
        context.demo.you = "me?";
        context.demo.what = "test";

        var output = tmpl.render(context);

        assert.equal(output, "lol:hi you:me? what:test ");
      });

      it("can loop over the object keys", function() {
        var tmpl = combyne("{%each demo as val key%}{{key}}{%endeach%}");
        var output = tmpl.render({
          demo: { lol: "hi", you: "me?", what: "test" }
        });

        assert.equal(output, "lolyouwhat");
      });

      it("will do nothing when looping over the object", function() {
        var tmpl = combyne("{%each demo%}key{%endeach%}");
        var output = tmpl.render({ demo: { lol: "hi", you: "me?", what: "test" } });

        assert.equal(output, "keykeykey");
      });

      it("loops over the repeated object property", function() {
        var tmpl = combyne("{%each demo%}{{demo.lol}}{%endeach%}");
        var output = tmpl.render({ demo: { lol: "hi", you: "me?", what: "test" } });

        assert.equal(output, "hihihi");
      });

      it("loops over the repeat property function", function() {
        var tmpl = combyne("{%each demo%}{{demo.lol}}{%endeach%}");
        var output = tmpl.render({
            demo: { lol: function() {
            return "hi";
          }, you: "me?", what: "test" }
        });

        assert.equal(output, "hihihi");
      });

      it("loops over the objects repeat property function with a filter", function() {
        var tmpl = combyne("{%each demo%}{{demo.lol|reverse}}{%endeach%}");

        tmpl.registerFilter("reverse", function(val) {
          return val.split("").reverse().join("");
        });

        var output = tmpl.render({
          demo: { lol: function() {
            return "hi";
          }, you: "me?", what: "test" }
        });

        assert.equal(output, "ihihih");
      });
    });

    describe("complex loops with conditionals", function() {
      it("can iterate with no context", function() {
        var tmpl = combyne("{%each demo%}{%if 'lol' == 'lol'%}test{%endif%}{%endeach%}");
        var output = tmpl.render({ demo: [ 1, 2, 3 ] });

        assert.equal(output, "testtesttest");
      });

      it("can iterate using original context", function() {
        var tmpl = combyne("{%each demo%}{%if test == 'lol'%}{{val}}{%endif%}{%endeach%}");
        var output = tmpl.render({ test: "lol", val: "hi", demo: [ 1, 2, 3 ] });

        assert.equal(output, "hihihi");
      });

      it("can iterate using own context", function() {
        var tmpl = combyne("{%each demo as val key%}{%if key == 'lol'%}{{val}}{%endif%}{%endeach%}");
        var output = tmpl.render({ demo: { lol: "hi", you: "me?", what: "test" } });

        assert.equal(output, "hi");
      });

      it("can iterate with conditionals in each loop", function() {
        var tmpl = combyne("{%each demo%}{%each demo2%}{%if 'lol' == 'lol'%}test{%endif%}{%endeach%}{%endeach%}");
        var output = tmpl.render({ demo: [ 1, 2, 3 ], demo2: [1] });

        assert.equal(output, "testtesttest");
      });

      it("can iterate using original context", function() {
        var tmpl = combyne("{%each demo%}{%each demo2%}{%if test == 'lol'%}{{val}}{%endif%}{%endeach%}{%endeach%}");
        var output = tmpl.render({ test: "lol", val: "hi", demo: [ 1, 2, 3 ], demo2: [1] });

        assert.equal(output, "hihihi");
      });

      it("can iterate in each loop using no context", function() {
        var tmpl = combyne("{%each demo as i%}{%if i == 1%}test{%else%}{{i}}{%endif%}{%endeach%}");
        var output = tmpl.render({ demo: [ 1, 2, 3 ], demo2: [1] });

        assert.equal(output, "test23");
      });
    });
  });
});
