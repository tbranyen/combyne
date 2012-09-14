module.exports = function(grunt) {

  grunt.initConfig({
    pkg: "<json:package.json>",

    test: {
      files: ["test/*.js"]
    },

    lint: {
      files: ["grunt.js", "combyne.js"]
    },

    min: {
      "dist/combyne.min.js": "combyne.js"
    },

    watch: {
      files: "<config:lint.files>",
      tasks: "lint test"
    },

    jshint: {
      options: {
        boss: true,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        noarg: true,
        sub: true,
        undef: true,
        eqnull: true,
        node: true,
        evil: true
      },

      globals: {
        define: true,
        escape: true
      }
    }
  });

  // Default task.
  grunt.task.registerTask("default", "lint min");

};
