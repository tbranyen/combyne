require "karma-sauce-launcher"
require "karma-coverage"

module.exports = ->
  @loadNpmTasks "grunt-karma"

  sauceLabs =
    sl_safari:
      base: "SauceLabs"
      browserName: "safari"

    sl_chrome:
      base: "SauceLabs"
      browserName: "chrome"

    sl_firefox:
      base: "SauceLabs"
      browserName: "firefox"

    sl_ie_8:
      base: "SauceLabs"
      platform: "Windows XP"
      browserName: "internet explorer"
      version: "8"

    sl_ie_9:
      base: "SauceLabs"
      platform: "Windows 7"
      browserName: "internet explorer"
      version: "9"

  @config "karma",
    options:
      basePath: process.cwd()
      singleRun: true
      captureTimeout: 7000
      autoWatch: true
      logLevel: "ERROR"

      reporters: ["dots", "coverage"]
      browsers: ["PhantomJS"]

      frameworks: ["mocha"]

      plugins: [
        "karma-mocha"
        "karma-phantomjs-launcher"
        "karma-coverage"
      ]

      preprocessors:
        "lib/!(support).js": "coverage"
        "lib/!(support)/**/*.js": "coverage"

      coverageReporter:
        type: "lcov"
        dir: "test/coverage"

      files: [
        "bower_components/assert/assert.js"
        "bower_components/json3/lib/json3.js"
        "bower_components/requirejs/require.js"
        "test/runner.js"

        { pattern: "lib/**/*.*", included: false }
        { pattern: "bower_components/**/*.*", included: false }
        { pattern: "test/tests/**/*.js", included: false }
      ]

    watch:
      options:
        singleRun: false

    source:
      options:
        singleRun: true

    modern:
      options:
        singleRun: true

        files: [
          "bower_components/assert/assert.js"
          "bower_components/json3/lib/json3.js"
          "bower_components/requirejs/require.js"
          "test/set-modern.js"
          "test/runner.js"

          { pattern: "dist/combyne.js", included: false }
          { pattern: "lib/**/*.*", included: false }
          { pattern: "bower_components/**/*.*", included: false }
          { pattern: "test/tests/**/*.js", included: false }
        ]

    legacy:
      options:
        singleRun: true

        files: [
          "bower_components/assert/assert.js"
          "bower_components/json3/lib/json3.js"
          "bower_components/requirejs/require.js"
          "test/set-legacy.js"
          "test/runner.js"

          { pattern: "dist/combyne.legacy.js", included: false }
          { pattern: "lib/**/*.*", included: false }
          { pattern: "bower_components/**/*.*", included: false }
          { pattern: "test/tests/**/*.js", included: false }
        ]

    saucelabs:
      options:
        captureTimeout: 120000
        singleRun: true
        customLaunchers: sauceLabs
        browsers: Object.keys sauceLabs
        reporters: ["dots", "saucelabs"]

        plugins: [
          "karma-mocha"
          "karma-phantomjs-launcher"
          "karma-sauce-launcher"
          "karma-coverage"
        ]

        sauceLabs:
          testName: "Combyne Browser Tests"
          takeScreenshots: false
