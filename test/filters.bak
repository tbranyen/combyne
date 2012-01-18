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

exports.notAFilter = function( test ) {
  test.expect(1);

  var tmpl = combyne('||');
  test.equals( tmpl.render(), '||', 'Doesn\'t attempt to render non-filters' );

  test.done();
};

exports.propertyFilters = function( test ) {
  test.expect(4);

  // Basic modulus filter
  var tmpl = combyne('{{test|mod6}}', { test: 15.5 });
  tmpl.filters.add('mod6', function( val ) {
    return val % 6;
  });
  test.equals( tmpl.render(), 3.5, 'Numerical modulus filter' );

  // Slightly more complicated reverse filter
  var tmpl2 = combyne('testing this out {{test|reverse}}', { test: 'tart' });
  tmpl2.filters.add('reverse', function( val ) {
    return Array.prototype.slice.call(val).reverse().join('');
  });
  test.equals( tmpl2.render(), 'testing this out trat', 'Reverse filter' );
 
  // Complex filter with arguments
  var tmpl3 = combyne('{{test|concat "lol" "hi" "how" "are" "you"}}', { test: 'hmm' });
  tmpl3.filters.add('concat', function( val ) {
    for(var i = 1, len=arguments.length; i<len; i++) {
      val += ' ' + arguments[i];
    }

    return val;
  });
  test.equals( tmpl3.render(), 'hmm lol hi how are you', 'Complex filter with arguments' );

  // Object filter
  var tmpl4 = combyne('{{test|obj}}', { test: {tmp:'test'} });
  tmpl4.filters.add('obj', function( val ) {
    return val['tmp'];
  });
  test.equals( tmpl4.render(), 'test', 'Testing with an object passed as val' );

  test.done();
};

exports.chainedFilters = function( test ) {
  test.expect(1);

  // Basic chainable functions
  var tmpl = combyne('{{test|addWord "fart"|reverse}}', { test: 'hi' });
  tmpl.filters.add('addWord', function( val, word ) {
    return val + word;
  });
  tmpl.filters.add('reverse', function( val ) {
    return Array.prototype.slice.call(val).reverse().join('');
  });
  test.equals( tmpl.render(), 'trafih', 'Basic chainable functions' );

  test.done();
};

exports.typedFilters = function( test ) {
  test.expect(1);

  // Basic chainable functions
  var tmpl = combyne('{{test|add 5}}', { test: 1 });
  tmpl.filters.add('add', function( val, num ) {
    return val + num;
  });
  test.equals( tmpl.render(), '6', 'Work with number types' );

  test.done();
};

exports.nestedFilters = function( test ) {
  test.expect(1);

  var obj = { item: [ 'hi', 'you', 'own' ] };
  var tmpl = combyne('{%each item%} {{.|render}} {%endeach%}', obj);

  tmpl.filters.add('render', function(val) {
    return combyne('Name: {{name}}', { name: val }).render();
  });

  test.equals( tmpl.render(), ' Name: hi  Name: you  Name: own ', 'Render templates inside filters' );

  test.done();
};
