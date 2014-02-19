(function(window) {
  "use strict";

  var karma = window.__karma__;

  // Put Karma into an asynchronous waiting mode until we have loaded our
  // tests.
  karma.loaded = function() {};

  // Use chai with Mocha.
  window.expect = window.chai.expect;

  // Set the baseUrl to `/base/` where Karma serves from.
  require({
    baseUrl: "/base/"
  }, ["bower_components/lodash/dist/lodash"], function(_) {
    var tests = _.chain(karma.files)
      // Convert the files object to an array of file paths.
      .map(function(id, file) { return file; })
      // Load tests automatically.
      .filter(function(file) {
        return /^\/base\/(test)\/tests\/.*\.js$/.test(file);
      })
      .value();

    // Load all tests and start Karma.
    require(tests, karma.start);
  });
})(this);
