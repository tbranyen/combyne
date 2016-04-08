module.exports = ->
  @loadTasks "build/tasks"

  @registerTask "test", [
    "jshint"
    "browserify"
    "simplemocha"
    "karma:modern"
    "karma:legacy"
    "karma:source"
  ]

  @registerTask "default", [
    "test"
    "karma:watch"
  ]
