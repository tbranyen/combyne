require "karma-coverage"

module.exports = ->
  @loadNpmTasks "grunt-karma"

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
