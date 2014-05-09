module.exports = ->
  @loadTasks "build/tasks"

  @registerTask "test", [
    "jshint"
    "jscs"
    "browserify"
    "simplemocha"
    "karma:run"
  ]

  @registerTask "default", [
    "jshint"
    "jscs"
    "browserify"
    "karma:daemon"
  ]
