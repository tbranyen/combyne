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

exports.propertyReplace = function( test ) {
  test.expect(6);

  // Simple single replace
  var tmpl = combyne('{{test}}', { test: 'hello world' });
  test.equals( tmpl.render(), 'hello world', 'Single property replace' );

  // Two replaces
  var tmpl2 = combyne('{{test}} {{test1}}', { test: 'hello world', test1: 'to you' });
  test.equals( tmpl2.render(), 'hello world to you', 'Two property replaces' );

  // Function property
  var tmpl3 = combyne('{{test}} {{test2}}', { test: 'hello world', test2: function() { return 'lol'; } });
  test.equals( tmpl3.render(), 'hello world lol', 'Two property replaces, but one replace with function property' );

  // Null byte
  var tmpl4 = combyne('{{test}}\00{{test1}}', { test: 'hello world', test1: 'to you' });
  test.equals( tmpl4.render(), 'hello world\0to you', 'Two property replaces divided with null byte' );

  // Handling various types of whitespace
  var tmpl5 = combyne('{{test}}\t{{test1}}\n{{test}}\r{{test1}}\r\n{{test}}   {{test1}}', { test: 'hello world', test1: 'to you' });
  test.equals( tmpl5.render(), 'hello world\tto you\nhello world\rto you\r\nhello world   to you', 'Mutliple replaces separated by various types of whitespace' );

  // Unicode support
  var tmpl6 = combyne('{{test}}', { test: '\u2C64' });
  test.equals( tmpl6.render(), '\u2C64', 'Cool R latin extended unicode support' );

  test.done();
};

exports.objectReplace = function( test ) {
  test.expect(1);

  // Simple object replace
  var tmpl = combyne('{{test.lol}}', { test: { lol: 'hello world' } });
  test.equals( tmpl.render(), 'hello world', 'Single object property replace' );

  test.done();
};
