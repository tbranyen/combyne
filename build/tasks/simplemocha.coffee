module.exports = ->
  @loadNpmTasks "grunt-simple-mocha"

  require "../../test/runner"

  @config "simplemocha",
    options:
      reporter: "dot"

    all:
      src: ["test/tests/**/*.js"]
