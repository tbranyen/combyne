module.exports = ->
  @loadNpmTasks "grunt-karma"

  require "karma-sauce-launcher"

  customLaunchers =
    SL_Chrome:
      base: "SauceLabs"
      browserName: "chrome"

    SL_Firefox:
      base: "SauceLabs"
      browserName: "firefox"
      version: "26"

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
        "lib/**/*.js": "coverage"

      coverageReporter:
        type: "lcov"
        dir: "test/coverage"

      files: [
        "bower_components/chai/chai.js"
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
        singleRun: true
        customLaunchers: customLaunchers
        browsers: Object.keys customLaunchers
        reporters: ["dots", "saucelabs"]

        plugins: [
          "karma-mocha"
          "karma-phantomjs-launcher"
          "karma-sauce-launcher"
          "karma-coverage"
        ]

        sauceLabs:
          testName: "Combyne Unit Tests"
