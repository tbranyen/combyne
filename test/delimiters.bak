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

exports.delimiters = function(test){
    test.expect(3);
    
    //Helper function to set the template delimiters
    function setDelimiters(tmpl){
      tmpl.delimiters = {
        START_PROP: '[[',
        END_PROP: ']]'
      };
    }

    var tmpl = combyne('[[New]]', {New: 'meow'});
    setDelimiters(tmpl);
    test.equals(tmpl.render(), 'meow', 'Basic Delimiters');
    
    var tmpl2 = combyne('[[one]] {{two}}', {one: 'meow', two: 'nothing'});
    setDelimiters(tmpl2);
    test.equals(tmpl2.render(), 'meow {{two}}', 'Delimiters mixed');

    var tmpl3 = combyne('[[one]] {{two}}', {one: 'meow', two: 'nothing'});
    test.equals(tmpl3.render(), '[[one]] nothing', 'Delimiters mixed 2');

    test.done();
};

