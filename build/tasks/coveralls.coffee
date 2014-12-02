module.exports = ->
  @loadNpmTasks "grunt-karma-coveralls"

  @config "coveralls",
    options:
      coverageDir: "test/coverage/"
      force: true
