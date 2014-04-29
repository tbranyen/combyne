define(function(require, exports, module) {
  "use strict";

  var isString = /['"]+/;

  /**
   *
   * @class
   * @constructor
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
      value: "",
      filters: []
    };

    // Keep iterating through the stack until END_PROP is found.
    while (this.stack.length) {
      var entry = this.stack.shift();

      switch (entry.name) {
        case "WHITESPACE": {
          break;
        }

        case "FILTER": {
          return this.constructFilter(propertyDescriptor);
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

  // Loop until END_PROP. BREAK if anything else is hit other than text.
  Tree.prototype.constructFilter = function(root) {
    var current = {
      type: "Filter",
      args: []
    };

    var previous = {};

    LOOP:
    while (this.stack.length) {
      var entry = this.stack.shift();

      switch (entry.name) {
        case "OTHER": {
          if (current.value === undefined) {
            current.value = entry.capture[0].trim();
          }
          else {
            current.args.push(entry.capture[0].trim());
          }

          break;
        }

        case "WHITESPACE": {
          break;
        }

        case "END_PROP": {
          root.filters.push(current);

          break LOOP;
        }

        // Allow nested filters.
        case "FILTER": {
          root.filters.push(current);
          this.constructFilter(root);
          break;
        }

        default: {
          throw new Error("Unexpected " + entry.name + " encountered.");
        }
      }

      previous = entry;
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
  Tree.prototype.constructConditional = function(root, kind) {
    root.type = root.type || "ConditionalExpression";
    root.conditions = root.conditions || [];

    var previous = {};

    if (kind === "ELSE") {
      root.els = { body: [] };
      return this.make(root.els, "END_IF");
    }

    if (kind === "ELSIF") {
      root.elsif = { body: [] };
      return this.constructConditional(root.elsif);
    }

    LOOP:
    while (this.stack.length) {
      var entry = this.stack.shift();
      var value = entry.capture[0].trim();

      switch (entry.name) {
        case "NOT": {
          root.conditions.push({
            type: "Not"
          });

          break;
        }

        case "EQUALITY":
        case "NOT_EQUALITY":
        case "GREATER_THAN":
        case "GREATER_THAN_EQUAL":
        case "LESS_THAN":
        case "LESS_THAN_EQUAL": {
          root.conditions.push({
            type: "Equality",
            value: entry.capture[0].trim()
          });

          break;
        }

        case "END_EXPR": {
          break LOOP;
        }

        case "WHITESPACE": {
          break;
        }

        default: {
          if (value === "false" || value === "true") {
            root.conditions.push({
              type: "Literal",
              value: value
            });

            break;
          }
          // Easy way to determine if the value is NaN or not.
          else if (Number(value) === Number(value)) {
            root.conditions.push({
              type: "Literal",
              value: value
            });
          }
          else if (isString.test(value)) {
            root.conditions.push({
              type: "Literal",
              value: value
            });

            break;
          }
          else if (previous.type === "Identifier") {
            previous.value += value;
            break;
          }
          else {
            root.conditions.push({
              type: "Identifier",
              value: value
            });
            break;
          }
        }
      }

      // Store the previous condition object if it exists.
      previous = root.conditions[root.conditions.length - 1] || {};
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

        case "ELSIF":
        case "ELSE":
        case "START_IF": {
          if (type.name !== "START_IF") {
            expressionRoot = root;
          }

          return this.constructConditional(expressionRoot, type.name);
        }

        case "PARTIAL": {
          return this.constructPartial(expressionRoot);
        }

        default: {
          throw new Error("Invalid expression type.");
        }
      }
    }
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
          root.body.push(this.constructProperty());

          break;
        }

        case "START_EXPR": {
          if (result = this.constructExpression(root, END)) {
            root.body.push(result);
            break;
          }
          // Comments return false.
          else if (result !== false) {
            return;
          }

          break;
        }

        case "END_EXPR": {
          break;
        }

        default: {
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
