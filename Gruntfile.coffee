module.exports = ->
  @loadTasks "build/tasks"

  @registerTask "default", [
    "jshint"
    "jscs"
    "synchronizer"
  ]
