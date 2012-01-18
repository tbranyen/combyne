/*global config:true, task:true*/
config.init({
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
      newcap: true,
      noarg: true,
      sub: true,
      undef: true,
      eqnull: true,
      node: true
    },
    globals: {}
  }
});

// Default task.
task.registerTask("default", "lint min");
