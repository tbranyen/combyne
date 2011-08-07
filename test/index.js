var reporter = require( 'nodeunit' ).reporters['default'];
process.chdir( 'test/' );

reporter.run(
  [
    'common.js'
  , 'properties.js'
  , 'comments.js'
  , 'filters.js'
  , 'expressions.js'
  , 'delimiters.js'
  , 'partials.js'
  ]
);
