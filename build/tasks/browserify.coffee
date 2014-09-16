module.exports = ->
  @loadNpmTasks "grunt-browserify"

  @config "browserify",
    options:
      transform: ["deamdify"]

      browserifyOptions:
        standalone: "combyne"

    modern:
      options:
        "ignore": ["lib/support/**/*.js"]

      files:
        "dist/combyne.js": ["lib/index.js"]

    legacy:
      files:
        "dist/combyne.legacy.js": ["lib/index.js"]
