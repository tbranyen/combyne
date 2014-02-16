module.exports = ->
  @loadNpmTasks "grunt-karma"

  # Unit testing is provided by Karma.  Change the two commented locations
  # below to either: mocha, jasmine, or qunit.
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
        dir: "dist/coverage"

      files: [
        "vendor/bower/chai/chai.js"
        "vendor/bower/requirejs/require.js"
        "test/runner.js"

        { pattern: "lib/**/*.*", included: false }
        { pattern: "test/**/*.js", included: false }
      ]

    # This creates a server that will automatically run your tests when you
    # save a file and display results in the terminal.
    daemon:
      options:
        singleRun: false

    # This is useful for running the tests just once.
    run:
      options:
        singleRun: true