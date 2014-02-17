define(function(require, exports, module) {
  "use strict";

  var combyne = require("lib/index");

  describe("Partials", function() {});
});

/*
exports.partials = function( test ) {
  test.expect(4);

  // Simple single replace with same key name
  var tmpl = combyne('{{test}} {%partial test%}', { test: 'hello world' });
  tmpl.partials.add('test', '{{name}}', {
    name: 'lol'
  });
  test.equals( tmpl.render(), 'hello world lol', 'Simple single replace with same key name' );

  // Simple single replace with same key name
  var tmpl2 = combyne('{{test}} {%partial test%}', { test: 'hello world' });
  tmpl2.partials.add('test', '{{name}}', {
    name: 'lol'
  });
  test.equals( tmpl2.render(), 'hello world lol', 'Simple single replace with same key name' );

  // Empty partial context
  var tmpl3 = combyne('{{test}} {%partial test%}', { test: 'hello world' });
  tmpl3.partials.add('test', 'lol', {});
  test.equals( tmpl3.render(), 'hello world lol', 'Empty partial context' );

  // Empty partial context with trailing template data
  var tmpl4 = combyne('{{test}} {%partial test%} 123', { test: 'hello world' });
  tmpl4.partials.add('test', 'lol', {});
  test.equals( tmpl4.render(), 'hello world lol 123', 'Empty partial context with trailing template data' );

  test.done();
};
*/
