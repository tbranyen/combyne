module.exports = ->
  @loadNpmTasks "grunt-karma"

  require "karma-sauce-launcher"

  sauceLabs =
    sl_chrome:
      base: "SauceLabs"
      platform: "Windows 7"
      browserName: "chrome"

    sl_firefox:
      base: "SauceLabs"
      browserName: "firefox"
      version: "26"

    sl_ie_6:
      base: "SauceLabs"
      platform: "Windows XP"
      browserName: "internet explorer"
      version: "6"

    sl_ios_safari:
      base: "SauceLabs"
      platform: "OS X 10.9"
      browserName: "iphone"
      version: "7.1"

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
          testName: "Combyne Unit Tests"
