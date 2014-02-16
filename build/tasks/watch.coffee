module.exports = ->
  @loadNpmTasks "grunt-contrib-watch"

  @config "watch",
    files: "lib/**/*.js"

    tasks: ["synchronizer"]
