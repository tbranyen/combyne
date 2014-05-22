<img align="left" src="http://dl.dropboxusercontent.com/u/79007/combyne.png">

**Stable: 0.3.4**

[![Build Status](https://travis-ci.org/tbranyen/combyne.png?branch=master)](https://travis-ci.org/tbranyen/combyne)
[![Coverage Status](https://coveralls.io/repos/tbranyen/combyne/badge.png?branch=master)](https://coveralls.io/r/tbranyen/combyne?branch=master)

No dependencies.  Can be loaded as a browser global, AMD module, and Node
module.  Works with Browserify.  Can be installed via NPM or Bower.

## Install. ##

Node:

``` bash
npm install combyne
```

Bower:

``` bash
bower install combyne
```

## Getting started. ##

### Node. ###

Require in your source:

``` javascript
var combyne = require("combyne");
```

### AMD. ###

``` javascript
// Configure the path if necessary.
require({
  paths: {
    combyne: "path/to/combyne"
  }
});

// Use in a module.
define(["combyne"], function(combyne) {});
```

There is also an AMD plugin for easier consumption and building:

https://github.com/tbranyen/combyne-amd-loader

### Browser global. ###

[Include the latest stable](https://github.com/tbranyen/combyne/releases)
in your markup:

``` html
<script src="combyne.js"></script>
```

#### Compatibility. ####

[![Selenium Test Status](https://saucelabs.com/browser-matrix/combyne.svg)](https://saucelabs.com/u/combyne)

## Basic usage. ##

``` javascript
var tmpl = combyne("hello {{msg}}!");
tmpl.render({ msg: "world" });

// => hello world!
```

## Features. ##

Combyne works by parsing your template into an AST.  This provides mechanisms
for intelligent compilation and optimization.  The template is converted to
JavaScript and invoked upon calling render with data.

### Comments. ###

Comments are useful for ignoring anything between the open and close.  They can
be nested.

``` javascript
var tmpl = combyne("test {%-- not parsed --%}");
tmpl.render();

// => test 
```

### Custom delimiters. ###

If you are not happy with the default Mustache-like syntax, you can trivially
change the delimiters to suit your needs.  You may only change the delimiters
at a global level, because templates are compiled immediately after invoking
the `combyne` function.

``` javascript
// This sets the delimiters, and applies to all templates.
combyne.options.delimiters = {
  START_PROP: "[[",
  END_PROP: "]]"
};

var tmpl = combyne("[[msg]]", { msg: "hello world" });

tmpl.render();
// => hello world
```

### Replacing template variables. ###

``` javascript
var template = "{{foo}}";
var context = { foo: "hello" };

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output == "hello"
```

### Using filters on variables. ###

``` javascript
var template = "{{foo|reverse}}";
var context = { foo: "hello" };

var tmpl = combyne(template);

tmpl.registerFilter("reverse", function(val) {
  return val.split("").reverse().join("");
});

var output = tmpl.render(context);
/// output == "olleh"
```

#### Passing arguments to filters. ####

You may find that the property value is not enough information for the filter
function, in which case you can send additional arguments.

``` javascript
var tmpl = combyne("{{ code|highlight 'javascript' }}");

tmpl.registerFilter("highlight", function(code, language) {
  // Magic highlight function that takes code and language.
  return highlight(code, language);
});
```

#### Chaining filters on variables. ####

``` javascript
var template = "{{foo|reverse|toUpper}}";
var context = { foo: "hello" };

var tmpl = combyne(template);

tmpl.registerFilter("reverse", function(val) {
  return val.split("").reverse().join("");
});

tmpl.registerFilter("toUpper", function(val) {
  return val.toUpperCase();
});

var output = tmpl.render(context);
/// output == "OLLEH"
```

### Conditionals. ###

Instead of being *logic-less*, `combyne` doesn't make any assumptions and
allows you to do things like `if/elsif/else` with simple conditionals,
such as `if something == somethingElse` or `if not something`.  All data 
types will be coerced to Strings except for Numbers.

``` javascript
var template = "{%if not foo%}why not?{%endif%}";
var context = { foo: false };

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output == "why not?"
```

or a more complicated example...

``` javascript
var template = "{%if foo == 'hello'%}Hi!{%else%}bye...{%endif%}";
var context = { foo: "hello" };

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output == "Hi!"
```

elsif is also supported:

``` javascript
var template = "{%if foo == ''%}goodbye!{%elsif foo == 'hello'%}hello!{%endif%}";
var context = { foo: "hello" };

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output == "hello!"
```

### Iterating arrays. ###

*Also works on array-like objects: arguments and NodeList.*

``` javascript
var template = "{%each foo%}{{.}} {%endeach%}";
var context = { foo: [1,2,3,4] };

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output == "1 2 3 4 "
```

#### Change the iterated identifer within loops. ####

``` javascript
var template = "{%each arr as val%}{{val}}{%endeach%}";
var context = { arr: [1,2,3] };

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output = "123"
```

### Iterating objects. ###

``` javascript
var template = "{%each fruits as val key%}the {{key}} is {{val}}{%endeach%}";
var context = {
  fruits: {
    apple: "green"
  }
};

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output == "the apple is green"
```

### Partials. ###

``` javascript
var template = "{{foo}} {%partial bar%}";
var context = { foo: "hello" };

var tmpl = combyne(template);

tmpl.registerPartial("bar", combyne("{{name}}", {
  name: "john"
}));

var output = tmpl.render(context);
/// output == "hello john"
```

## Unit tests. ##

There are many ways to run the unit tests as this library can operate in
various environments.

### Browser ###

Open test/index.html in your web browser.

### Node ###

Run the tests inside the Node runtime and within PhantomJS:

``` bash
grunt test
```

### Continuous testing ###

To keep the PhantomJS tests running continuously, run:

``` bash
grunt karma:daemon
```

The tests will automatically run whenever files change.

#### Code coverage ####

If you run the tests through Karma, a test/coverage directory will be created
containing folders that correspond with the environment where the tests were
run.

If you are running the defaults you should see something that looks like:

``` unicode
.
└── coverage
    ├── Chrome 33.0.1750 (Linux)
    └── PhantomJS 1.9.7 (Linux)
```

Inside PhantomJS contains the HTML output that can be opened in a browser to
inspect the source coverage from running the tests.
