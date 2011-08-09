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

exports.basicComments = function( test ) {
  test.expect(4);

  // A block comment
  var tmpl = combyne('{%--nothing--%}', {});
  test.equals( tmpl.render(), '', 'Commenting out everything' );

  // Single line comment
  var tmpl2 = combyne('{%--a pointless message--%}', {});
  test.equals( tmpl2.render(), '', 'Single line comment' );

  // Invalid comment token
  var tmpl3 = combyne('--', {});
  test.equals( tmpl3.render(), '--', 'Invalid comment' );
  
  // Invalid comment and expression, expected behavior is nothing shows up
  var tmpl4 = combyne('{%--', {});
  test.equals( tmpl4.render(), '', 'Invalid comment' );

  test.done();
};

exports.propertyComments = function( test ) {
  test.expect(2);

  // Do not render the property
  var tmpl = combyne('{%--{{test}}--%}', { test: 'hello world' });
  test.equals( tmpl.render(), '', 'Do not render property' );

  // Missing end comment should stop parsing
  var tmpl2 = combyne('{{hello}}{%--{{test}}', { test: 'hello world', hello: 'goodbye' });
  test.equals( tmpl2.render(), 'goodbye', 'Render hello, disgard the rest' );

  test.done();
};

exports.commentComments = function( test ) {
  test.expect(2);

  // Nested comments with raw value
  var tmpl = combyne('{%--{%-- lol --%}--%}har', {});
  test.equals( tmpl.render(), 'har', 'Handle nested comments' );
  
  // Nested comments with property value
  var tmpl2 = combyne('{%--{%-- {{lol}} --%}--%}har', { lol: "hi" });
  test.equals( tmpl2.render(), 'har', 'Handle nested comments with property value' );

  test.done();
};
