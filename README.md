Combyne
=======

> A template engine that works the way you expect.

[![Build Status](https://travis-ci.org/tbranyen/combyne.png?branch=master)](https://travis-ci.org/tbranyen/combyne)
[![Coverage Status](https://coveralls.io/repos/tbranyen/combyne/badge.png?branch=master)](https://coveralls.io/r/tbranyen/combyne?branch=master)

No dependencies.  Can be loaded as browser global, AMD module, Node module, and
Browserify module.  Can be installed via NPM, Bower, or JamJS.

## Getting started. ##

Combyne can run under a variety of JavaScript engines and loaders:

### Node. ###

Install via NPM:

``` bash
npm install combyne
```

Require in your project:

``` javascript
var combyne = require('combyne');
```

### AMD. ###

If you install via Bower you will need to configure the path, which is the
first step below, however if you install with JamJS you can skip that step.

``` javascript
// Configure the path, if necessary.
require.config({
  paths: {
    combyne: 'path/to/combyne'
  }
});

// Use in a module.
define(['combyne'], function(combyne) {});
```

### Browser global. ###

[Include the latest stable](http://cloud.github.com/downloads/tbranyen/combyne/combyne.js)
in your markup:

``` html
<script src="combyne.js"></script>
```

### Additional details. ###

#### Compatibility. ####

__Desktop:__ IE 9+, Chrome 13+, Opera 11+, FireFox 3.6+, and Safari 5+.


__Mobile:__ Android Browser 2.3.4+ , Opera 9.80+ , FireFox Beta, and iPad.

#### File size. ####

Just 2.7KB when serving minfied and gzipped.

## Basic usage. ##

``` javascript
var tmpl = combyne('hello {{msg}}!');
tmpl.render({ msg: 'world' });

// => hello world!
```

## Features. ##

Combyne works by parsing your template into a stack and rendering data.

Combyne works by parsing your template into an AST.  This provides mechanisms
for intelligent compilation and optimization.  The template is converted to
JavaScript and invoked upon calling render.

### Comments. ###

Comments are useful for ignoring anything between the open and close.  They can
be nested.

``` javascript
var tmpl = combyne('test {%-- not parsed --%}');
tmpl.render();

// => test 
```

### Custom delimiters. ###

If you are not happy with the default Mustache-like syntax, you can trivially
change the delimiters to suit your needs.  The delimiters may be changed at a
local or global level.

``` javascript
combyne.options.delimiters = {
  START_PROP: '[[',
  END_PROP: ']]'
};

var tmpl = combyne('[[msg]]', { msg: 'hello world' });

tmpl.render();
// => hello world
```

### Replacing template variables. ###

``` javascript
var template = '{{lol}}';
var context = { lol: 'test' };

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output == 'test'
```

### Using filters on variables. ###

``` javascript
var template = '{{lol|reverse}}';
var context = { lol: 'test' };

var tmpl = combyne(template);
tmpl.filters.add('reverse', function(val) {
  return val.split('').reverse().join('');
});

var output = tmpl.render(context);
/// output == 'tset'
```

#### Passing arguments to filters. ####

You may find that the property value is not enough information for the filter
function, in which case you can send additional arguments.

``` javascript
var tmpl = combyne('{{ code|highlight "javascript" }}');

tmpl.registerFilter('highlight', function(code, language) {
  // Magic highlight function that takes code and language.
  return highlight(code, language);
});
```

#### Chaining filters on variables. ####

``` javascript
var template = '{{lol|reverse|toUpper}}';
var context = { lol: 'test' };

var tmpl = combyne(template);
tmpl.filters.add('reverse', function(val) {
  return val.split('').reverse().join('');
});
tmpl.filters.add('toUpper', function(val) {
  return val.toUpperCase();
});

var output = tmpl.render(context);
/// output == 'TSET'
```

### Conditionals. ###

Instead of being *logic-less*, `combyne` doesn't make any assumptions and
allows you to do things like `if/elsif/else` with simple conditionals,
such as `if something == somethingElse` or `if not something`.  All data 
types will be coerced to Strings except for Numbers.

``` javascript
var template = '{%if not test%}why not?{%endif%}';
var context = { test: false };

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output == 'why not?'
```

or a more complicated example...

``` javascript
var template = '{%if test == "hello"%}goodbye!{%else%}hello!{%endif%}';
var context = { test: 'hello' };

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output == 'goodbye!'
```

### Iterating arrays. ###

*Will not work on array-like objects, such as arguments or NodeList, coerce with
`Array.prototype.slice.call(obj);`*

``` javascript
var template = '{%each test%}{{.}} {%endeach%}';
var context = { test: [1,2,3,4] };

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output == '1 2 3 4 '
```

#### Change the iterated identifer within loops. ####

``` javascript
var template = '{%each arr as _%}{{_}}{%endeach%}';
var context = { arr: [1,2,3] };

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output = '123'
```

### Iterating objects. ###

``` javascript
var template = '{%each test as key val%}the {{key}} is {{val}}{%endeach%}';
var context = {
  test: {
    hello: 'lol'
  }
};

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output == 'the hello is lol'
```

### Partials. ###

``` javascript
var template = '{{test}} {%partial test%}';
var context = { test: 'hello' };

var tmpl = combyne(template);

tmpl.partials.add('test', '{{name}}', {
  name: 'you'
});

var output = tmpl.render(context);
/// output == 'hello you'
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
