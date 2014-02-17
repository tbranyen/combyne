define(function(require, exports, module) {
  "use strict";

  /**
   */
  function Tree(stack) {
    // Internally use a copy of the stack.
    this.stack = stack.slice();

    // The tree root.
    this.root = {
      type: "Template",
      body: []
    };
  }

  Tree.prototype.constructProperty = function() {
    var propertyDescriptor = {
      type: "Property",
      value: ""
    };

    // Keep iterating through the stack until END_PROP is found.
    while (this.stack.length) {
      var entry = this.stack.shift();

      switch (entry.name) {
        case "WHITESPACE": {
          break;
        }

        case "END_PROP": {
          return propertyDescriptor;
        }

        default: {
          propertyDescriptor.value += entry.capture[0].trim();
        }
      }
    }

    throw new Error("Unterminated property.");
  };

  // Loop until END_EXPR. BREAK if anything else is hit other than text.
  Tree.prototype.constructPartial = function(root) {
    root.type = "PartialExpression";

    // No body in a partial expression?
    delete root.body;

    // Partials have arguments passed.
    root.args = [];

    LOOP:
    while (this.stack.length) {
      var entry = this.stack.shift();

      switch (entry.name) {
        case "OTHER": {
          if (root.value === undefined) {
            root.value = entry.capture[0].trim();
          }
          else {
            root.args.push(entry.capture[0].trim());
          }

          break;
        }

        case "WHITESPACE": {
          break;
        }

        case "END_EXPR": {
          break LOOP;
        }

        default: {
          throw new Error("Unexpected " + entry.name + " encountered.");
        }
      }
    }

    return root;
  };

  // Loop until end expr. then pass off to make
  Tree.prototype.constructEach = function(root) {
    root.type = "LoopExpression";
    root.conditions = [];

    LOOP:
    while (this.stack.length) {
      var entry = this.stack.shift();

      switch (entry.name) {
        case "OTHER": {
          root.conditions.push({
            type: "Identifier",
            value: entry.capture[0].trim()
          });

          break;
        }

        case "ASSIGN": {
          root.conditions.push({
            type: "Assignment",
            value: entry.capture[0].trim()
          });

          break;
        }

        case "END_EXPR": {
          break LOOP;
        }
      }
    }

    this.make(root, "END_EACH");

    return root;
  };

  /**
   * Removes all tokens from the tree inside the commented area.
   */
  Tree.prototype.constructComment = function(root) {
    var previous = {};

    while (this.stack.length) {
      var entry = this.stack.shift();

      switch (entry.name) {
        case "COMMENT": {
          if (previous.name === "START_EXPR") {
            this.constructComment(root);
            break;
          }

          break;
        }

        case "END_EXPR": {
          if (previous.name === "COMMENT") {
            return false;
          }

          break;
        }
      }

      previous = entry;
    }

    return false;
  };

  // Loop until end expr then pass off to make until END_IF is hit.
  Tree.prototype.constructConditional = function(root) {
    root.type = "ConditionalExpression";
    root.conditions = [];

    LOOP:
    while (this.stack.length) {
      var entry = this.stack.shift();

      switch (entry.name) {
        case "OTHER": {
          root.conditions.push({
            type: "Identifier",
            value: entry.capture[0].trim()
          });

          break;
        }

        case "NOT": {
          root.conditions.push({
            type: "Not"
          });

          break;
        }

        case "EQUALITY": {
          root.conditions.push({
            type: "Equality"
          });

          break;
        }

        case "END_EXPR": {
          break LOOP;
        }
      }
    }

    this.make(root, "END_IF");
    return root;
  };

  Tree.prototype.constructExpression = function(root, END) {
    var expressionRoot = {
      body: []
    };

    // Find the type.
    while (this.stack.length) {
      var type = this.stack.shift();

      switch (type.name) {
        //  WHEN ANY OF THESE ARE HIT, BREAK OUT.
        case END: {
          return;
        }

        case "WHITESPACE": {
          break;
        }

        case "COMMENT": {
          return this.constructComment(expressionRoot);
        }

        case "START_EACH": {
          return this.constructEach(expressionRoot);
        }

        case "START_IF": {
          return this.constructConditional(expressionRoot);
        }

        case "ELSE": {
          return this.constructConditional(expressionRoot);
        }

        case "ELSIF": {
          return this.constructConditional(expressionRoot);
        }

        case "PARTIAL": {
          return this.constructPartial(expressionRoot);
        }

        default: {
          throw new Error("Invalid expression type.");
        }
      }
    }

    return expressionRoot;
  };

  /**
   * SHOULD ACCEPT A CALLBACK BREAK OUT FUNCTION, THIS WILL BE PASSED TO
   * CONSTRUCT EXPRESSION.
   */
  Tree.prototype.make = function(root, END) {
    root = root || this.root;

    var result;

    // Pull out the first item in the stack.
    while (this.stack.length) {
      var entry = this.stack.shift();
      var prev = root.body[root.body.length - 1];

      switch (entry.name) {
        case "START_PROP": {
          if (result = this.constructProperty()) {
            root.body.push(result);
          }

          break;
        }

        case "START_EXPR": {
          if (result = this.constructExpression(root, END)) {
            root.body.push(result);
            break;
          }
          // Comments return false.
          else if (result === false) {
            break;
          }
          else {
            return;
          }

          break;
        }

        case "OTHER":
        case "WHITESPACE": {
          var prevWhitespace = "";

          // Detect previous whitespace to condense.
          if (prev && prev.type === "Text") {
            root.body.pop();
            prevWhitespace = prev.value;
          }

          root.body.push({
            type: "Text",
            value: prevWhitespace + entry.capture[0]
          });

          break;
        }
      }
    }

    return root;
  };

  module.exports = Tree;
});
