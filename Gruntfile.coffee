module.exports = ->
  @loadTasks "build/tasks"

  @registerTask "test", [
    "jshint"
    "jscs"
    "browserify"
    "simplemocha"
    "karma:source"
    "karma:modern"
    "karma:legacy"
  ]

  @registerTask "default", [
    "test"
    "karma:watch"
  ]
