module.exports = ->
  @loadTasks "build/tasks"

  @registerTask "test", [
    "jshint"
    "jscs"
    "karma:run"
  ]

  @registerTask "default", [
    "jshint"
    "jscs"
    #"synchronizer"
    "karma:daemon"
  ]
