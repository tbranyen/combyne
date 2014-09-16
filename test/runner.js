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
    "lib/utils/defaults",
    "lib/compiler",
    "lib/grammar",
    "lib/index",
    "lib/tokenizer",
    "lib/tree",
    "basic",
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
    global.assert = require("assert");
    return require("amdefine/intercept");
  }

  // Put Karma into an asynchronous waiting mode until we have loaded our
  // tests.
  if (karma) { karma.loaded = function() {}; }

  // Prefer the BDD testing style.
  mocha.setup("bdd");

  // Modify the configuration to point to the correct source base.
  require.config({
    baseUrl: baseUrl,
    urlArgs: "bust=" + +new Date(),
    paths: {
      // Toggle the path to use a distribution or the source.
      "../../lib/index": window.useDist || "../../lib/index"
    },
    // Make it easier to `require("combyne")` in the browser REPL.
    map: {
      "*": {
        combyne: "../../lib/index"
      }
    }
  });

  // Load all tests and start Karma.
  require(tests, karma ? karma.start : function() { mocha.run(); });
})(this);
