module.exports = ->
#  @loadNpmTasks "grunt-synchronizer"

  @config "synchronizer",
    options:
      name: "combyne"

    build:
      files:
        "dist/combyne.js": "lib/index.js"
