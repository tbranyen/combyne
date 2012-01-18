var combyne = require( '../' );

// Helper functions
var helper = {
  // Test if obj is a true function
  testFunction: function( test, obj, label ) {
    // The object reports itself as a function
    test( typeof obj, 'function', label +' reports as a function.' );
    // This ensures the repo is actually a derivative of the Function [[Class]]
    test( toString.call( obj ), '[object Function]', label +' [[Class]] is of type function.' );
  },
  // Test code and handle exception thrown 
  testException: function( test, fun, label ) {
    try {
      fun();
      test( false, label );
    }
    catch (ex) {
      test( true, label );
    }
  }
};

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
