module.exports = ->
  @loadNpmTasks "grunt-browserify"

  @config "browserify",
    options:
      transform: ["deamdify"]
      standalone: "combyne"

    "dist/combyne.js": "lib/index.js"
