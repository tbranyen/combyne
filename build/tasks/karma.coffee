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
        "bower_components/chai/chai.js"
        "bower_components/requirejs/require.js"
        "test/runner.js"

        { pattern: "lib/**/*.*", included: false }
        { pattern: "bower_components/**/*.*", included: false }
        { pattern: "test/**/*.js", included: false }
      ]

    test:
      options:
        singleRun: true
