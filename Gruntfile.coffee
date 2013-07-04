# Grunt configuration updated to latest Grunt.  That means your minimum
# version necessary to run these tasks is Grunt 0.4.
#
# Install `grunt` locally and `grunt-cli` globally.
module.exports = ->

  # Initialize the configuration.
  @initConfig

    # Lint source, node, and test code with some sane options.
    jshint:
      files: ["combyne.js"]

      options:
        boss: true
        evil: true
        proto: true

    nodeunit:
      files: "test/*.js"

  # Load external Grunt task plugins.
  @loadNpmTasks "grunt-contrib-jshint"
  @loadNpmTasks "grunt-contrib-nodeunit"

  # Default task.
  @registerTask "default", ["jshint", "nodeunit"]
