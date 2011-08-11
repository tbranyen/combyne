var combyne = require( '../' );

// Helper functions
var helper = {
  // Test if obj is a true function
  testFunction: function( test, obj, label ) {
    // The object reports itself as a function
    test( typeof obj, 'function', label +' reports as a function.' );
    // This ensures the repo is actually a derivative of the Function [[Class]]
    test( {}.toString.call( obj ), '[object Function]', label +' [[Class]] is of type function.' );
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

exports.constructor = function( test ) {
  test.expect( 5 );

  // Test for constructor function
  helper.testFunction( test.equals, combyne, 'combyne' );

  // Ensure we get an instance of combyne
  test.ok( new combyne() instanceof combyne, 'Invocation with new returns an instance of combyne' );
  test.ok( combyne() instanceof combyne, 'Invocation without new returns an instance of combyne' );

  // Test for filters property
  test.ok( combyne().filters, 'Property exists for adding custom filters' );

  test.done();
};
