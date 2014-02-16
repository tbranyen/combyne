define(function(require, exports, module) {
  "use strict";

  // Borrowed from Underscore.js template function.
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // Borrowed from Underscore.js template function.
  var escapes = {
    "'": "'",
    "\\": "\\",
    "\r": "r",
    "\n": "n",
    "\t": "t",
    "\u2028": "u2028",
    "\u2029": "u2029"
  };

  function escapeValue(value) {
    return value.replace(escaper, function(match) {
      return "\\" + escapes[match];
    });
  }

  /**
   *
   *
   */
  function Compiler(tree) {
    this.tree = tree;
    this.string = "";

    var commands = [];

    // Parse the tree and compile to JavaScript.
    this.tree.body.forEach(function(entry) {
      if (entry.type === "Property") {
        commands.push(this.compileProperty(entry));
      }

      if (entry.type === "Text") {
        commands.push("'" + escapeValue(entry.value) + "'");
      }
    }, this);

    var body = commands.join("+");

    // If there is a function, concatenate it to the default empty value.
    if (body) {
      body = " + " + body;
    }

   // Compile the function from the source code.
    this.func = new Function("data", "return ''" + body + ";");
    // toString the function to get its raw source and expose.
    this.source = this.func.toString();
  }

  Compiler.prototype.compileProperty = function(entry) {
    return "(data['" + entry.value + "']||'')";
  };

  module.exports = Compiler;
});
