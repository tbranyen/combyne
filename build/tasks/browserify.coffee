module.exports = ->
  @loadNpmTasks "grunt-browserify"

  @config "browserify",
    options:
      transform: ["deamdify"]
      standalone: "combyne"

    modern:
      options:
        "exclude": ["lib/support/**/*.js"]

      files:
        "dist/combyne.js": ["lib/index.js"]

    legacy:
      files:
        "dist/combyne.legacy.js": ["lib/index.js"]
