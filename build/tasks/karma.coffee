module.exports = ->
  @loadNpmTasks "grunt-karma"

  require "karma-sauce-launcher"

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

    sl_ie_7:
      base: "SauceLabs"
      platform: "Windows XP"
      browserName: "internet explorer"
      version: "7"

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
        "bower_components/requirejs/require.js"
        "test/runner.js"

        { pattern: "lib/**/*.*", included: false }
        { pattern: "bower_components/**/*.*", included: false }
        { pattern: "test/tests/**/*.js", included: false }
      ]

    daemon:
      options:
        singleRun: false

    run:
      options:
        singleRun: true

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
