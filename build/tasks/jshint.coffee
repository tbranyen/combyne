module.exports = ->
  @loadNpmTasks "grunt-contrib-jshint"

  @config "jshint",
    files: ["lib/**/*.js"]
    options: @file.readJSON ".jshintrc"
