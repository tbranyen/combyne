module.exports = ->
  @loadTasks "build/tasks"

  @registerTask "test", [
    "jshint"
    "jscs"
    "karma"
  ]

  @registerTask "default", [
    "jshint"
    "jscs"
    "karma"
    "synchronizer"
  ]
