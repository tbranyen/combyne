module.exports = ->
  @loadNpmTasks "grunt-synchronizer"

  @config "synchronizer",
    options:
      name: "combyne"

    build:
      files:
        "combyne.js": "lib/index.js"
