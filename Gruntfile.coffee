module.exports = ->
  @loadTasks "build/tasks"

  @registerTask "default", [
    "jscs"
    "synchronizer"
  ]
