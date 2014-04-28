(function(window) {
 "use strict";

  // The Karma object.
  var karma = window.__karma__;

  // Source endpoint.
  var baseUrl = karma ? "/base/test/tests/" : "../test/tests/";

  // Tests to run.
  var tests = [
    "lib/utils/escape_delimiter",
    "lib/utils/type",
    "lib/compiler",
    "lib/grammar",
    "lib/index",
    "lib/tokenizer",
    "lib/tree",
    "comments",
    "delimiters",
    "expressions",
    "filters",
    "html",
    "partials",
    "properties",
  ];

  // Operating within Node, setup the AMD intercept and abort.
  if (typeof module === "object") {
    global.expect = require("chai").expect;
    return require("amdefine/intercept");
  }

  // Put Karma into an asynchronous waiting mode until we have loaded our
  // tests.
  if (karma) { karma.loaded = function() {}; }

  // Prefer the BDD testing style.
  mocha.setup("bdd");

  // Use chai with Mocha.
  window.expect = window.chai.expect;

  // Modify the configuration to point to the correct source base.
  require.config({ baseUrl: baseUrl }); 

  // Load all tests and start Karma.
  require(tests, karma ? karma.start : function() { mocha.run(); });
})(this);
