combyne.js: A template engine that works the way you'd expect.
==============================================================

Getting started
--------------

###Browser###

Download: [Production](http://cloud.github.com/downloads/tbranyen/combyne.js/combyne.min.js) or [Development](http://cloud.github.com/downloads/tbranyen/combyne.js/combyne.js)

Include: `<script src="combyne.js"></script>`

Compatibility: (Desktop) IE 9+, Chrome 13+, Opera 11+, FireFox 3.6+, Safari 5+, (Mobile) Android Browser 2.3.4+, Opera 9.80+, FireFox Beta, iPad

File size: 2.7KB when serving `Production version` with GZip

###Node.js###

To install `combyne`, you can clone this repository to your `node_modules`
folder or use the fantastic `NPM`:

``` bash
npm install combyne
```

Then simply `require` it in your projects to start using

``` javascript
var combyne = require('combyne');
```

Basic usage
-----------

``` javascript
var tmpl = combyne('{{test}}');
tmpl.render({ test: 'lol' }); // lol
```

Features
-------------

`combyne` works by parsing your template into a stack and rendering data.

###Single line comments###

``` javascript
var template = 'test {%-- single line comment --%}';

var tmpl = combyne(template);

var output = tmpl.render();
/// output == 'test '
```

####Block comments####

``` javascript
var template = 'test {%-- line 1\n\
                          line 2\n\
                     --%}';

var tmpl = combyne(template);

var output = tmpl.render();
/// output == 'test '
```

###Custom delimiters###

``` javascript
var template = '[[lol]]';
var context = { lol: 'test' };

var tmpl = combyne(template);
tmpl.delimiters = {
  START_PROP: '[[',
  END_PROP: ']]'
};

var output = tmpl.render(context);
/// output = 'test'
```

###Replacing template variables###

``` javascript
var template = '{{lol}}';
var context = { lol: 'test' };

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output == 'test'
```

###Using filters on variables###

``` javascript
var template = '{{test|reverse}}';
var context = { lol: 'test' };

var tmpl = combyne(template);
tmpl.filters.add('reverse', function(val) {
  return val.split('').reverse().join('');
});

var output = tmpl.render(context);
/// output == 'tset'
```

####Chaining filters on variables####

``` javascript
var template = '{{test|reverse|toUpper}}';
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

###Conditionals###

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

###Iterating arrays###

*Will not work on array-like objects, such as arguments or NodeList, coerce with
`Array.prototype.slice.call(obj);`*

``` javascript
var template = '{%each test%}{{.}} {%endeach%}';
var context = { test: [1,2,3,4] };

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output == '1 2 3 4 '
```

####You can change the iterated name within loops as well####

``` javascript
var template = '{%each arr as _%}{{_}}{%endeach%}';
var context = { arr: [1,2,3] };

var tmpl = combyne(template);

var output = tmpl.render(context);
/// output = '123'
```

###Iterating objects###

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

###Partials###

``` javascript
var template = '{{test}} {%partial test%}';
var context = { test: "hello" };

var tmpl = combyne(template);

tmpl.partials.add('test', '{{name}}', {
  name: 'you'
});

var output = tmpl.render(context);
/// output == 'hello you'
```


Running unit tests
------------------

###Browser###

Open `test/test.html` in your browser of choice.

###Node.js###

Run the follow command to fetch the `Node.js` dependencies.

``` bash
npm install
```

Then run the following command

``` bash
make test
```

License
-------

Copyright (c) 2011 Tim Branyen

This file is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License, version 2,
as published by the Free Software Foundation.

In addition to the permissions in the GNU General Public License,
the authors give you unlimited permission to link the compiled
version of this file into combinations with other programs,
and to distribute those combinations without any restriction
coming from the use of this file.  (The General Public License
restrictions do apply in other respects; for example, they cover
modification of the file, and distribution when not linked into
a combined executable.)

This file is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; see the file COPYING.  If not, write to
the Free Software Foundation, 51 Franklin Street, Fifth Floor,
Boston, MA 02110-1301, USA.
