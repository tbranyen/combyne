(function(window) {
 "use strict";

  // The Karma object.
  var karma = window.__karma__;

  // Source endpoint.
  var baseUrl = karma ? "/base/" : "../";

  // Tests to run.
  var tests = [
    "test/tests/lib/utils/escape_delimiter",
    "test/tests/lib/utils/type",
    "test/tests/lib/compiler",
    "test/tests/lib/grammar",
    "test/tests/lib/index",
    "test/tests/lib/tokenizer",
    "test/tests/lib/tree",
    "test/tests/comments",
    "test/tests/delimiters",
    "test/tests/expressions",
    "test/tests/filters",
    "test/tests/html",
    "test/tests/partials",
    "test/tests/properties",
  ];

  // Put Karma into an asynchronous waiting mode until we have loaded our
  // tests.
  if (karma) { karma.loaded = function() {}; }

  // Prefer the BDD testing style.
  mocha.setup("bdd");

  // Use chai with Mocha.
  window.expect = window.chai.expect;

  // Load all tests and start Karma.
  require({ baseUrl: baseUrl }, tests, karma ? karma.start : function() { mocha.run(); });
})(this);
