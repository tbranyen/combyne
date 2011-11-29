/* combyne.js v0.2.1
 * Copyright 2011, Tim Branyen (@tbranyen)
 * combyne.js may be freely distributed under the MIT license.
 */
(function(window) {

var toString = Object.prototype.toString;
var specialCharsExp = /[\^$\\\/.*+?()[\]{}|]/g;

// Escape any delimiters assigned
var escDelimiter = function() {
  var cache = {};

  return function(delimiter) {
    if (cache[delimiter]) {
      return cache[delimiter];
    }

    cache[delimiter] = delimiter.replace(specialCharsExp,"\\$&");
    
    return cache[delimiter];
  };
}();

// Mutable __proto__ polyfill
function proto(obj, original) {
  var f, i;

  function F() {}
  F.prototype = original;

  f = new F();

  for (i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    f[i] = obj[i];
  }
  
  return f;
}

// Object.keys polyfill
function getKeys(obj) {
  var key;
  var array = [];
  
  for(key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    array.push(key);
  }

  return array;
}

// From MDC
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
    "use strict";
    if (this === void 0 || this === null) {
      throw new TypeError();
    }
    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0) {
      return -1;
    }
    var n = 0;
    if (arguments.length > 0) {
      n = Number(arguments[1]);
      if (n !== n) { // shortcut for verifying if it's NaN
        n = 0;
      } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }
    if (n >= len) {
      return -1;
    }
    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
    for (; k < len; k++) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  }
}

// Tokenizer
var tokenizer = function() {
  var _tokens;

  return function(template, stack, tokens) {
    _tokens = tokens = tokens || _tokens;

    var i;
    var captures, token, key;
    var keys = getKeys(tokens);
    var len = keys.length;

    while(template.length) {
      for (i=0; i<len; i++) {
       key = keys[i];

        if (captures = tokens[key].exec(template)) {
          token = { name: key, captures: captures };
          template = template.replace(tokens[key], "");

          captures[0] && stack.push(token);
        }
      }
    }
  };
}();

var render = function() {
  var obj, innerText, names, _delimiters;
  var output = "";
  var retVal = "";

  // Resolve a template argument by type and possibly from the context
  // with expand dot notation.
  function normalizeArgument(arg, context) {
    var stringExp = /\'|\"/gi;

    if (stringExp.exec(arg)) {
      arg = arg.replace(stringExp, "");
    }
    else if (!isNaN(arg)) {
      arg = +arg;
    }
    else if (typeof arg === "string") {
      arg = context[arg] != null ? context[arg] : expandDotNotation(arg, context);

      // Support function arguments
      if (typeof arg === "function") {
        arg = arg();
      }
    }

    return arg;
  }

  // Execute a filter function on the specific template variable
  function runFilter(self, method, args, obj, context, mode) {
    var i, len;
    var filter = self.filters.get(method);   

    if (filter == null) {
      filter = function() { return obj; }

      if (self.debug) {
        throw new Error("Filter " + method + " not found");
      }
    }

    // Normalize all arguments
    for (i=0, len=args.length; i<len; i++) {
      args[i] = normalizeArgument(args[i], context);
    }

    args.unshift(obj);

    mode.unset("filter");

    return filter.apply(obj, args);
  }

  // Return the value of the dot notation template variable from the context
  function expandDotNotation(prop, context) {
    var parts = prop.split(".");

    function expand(context) {
      var tmpVar;
      var prop = parts.shift();
      
      tmpVar = context[prop];

      if (tmpVar != null) {
        return parts.length ? expand(tmpVar) : tmpVar;
      }
    }

    if (parts.length) {
      return expand(context);
    }
  }

  // Run a conditional from a complex if statement
  function runConditional(self, args, context, mode) {
    var i, arg, left, right, comparator, not;
    var len = args.length;
    var truthy = true;
    var compare = {
      "==": function(left, right) {
        if (left == right) {
          return true;
        }

        return false;
      },
      "!=": function(left, right) {
        if (left != right) {
          return true;
        }

        return false;
      },
      ">": function(left, right) {
        if (left > right) {
          return true;
        }

        return false;
      },
      ">=": function(left, right) {
        if (this["=="](left, right) || this[">"](left, right)) {
          return true;
        }

        return false;
      },
      "<": function(left, right) {
        if (left < right) {
          return true;
        }

        return false;
      },
      "<=": function(left, right) {
        if (this["=="](left, right) || this["<"](left, right)) {
          return true;
        }

        return false;
      },
      "not": function(val) {
        return !val;
      }
    };

    for (i=0; i<len; i++) {
      // Normalize numbers and everything else to strings
      arg = !isNaN(args[i]) ? +args[i] : args[i] + "";

      // Set not
      if (arg === "not") {
        not = true;
        continue;
      }

      // Set conditional
      if (compare[arg]) {
        comparator = arg;
        continue;
      }

      // Check for string
      arg = normalizeArgument(arg, context);

      // Negate this value
      if (not) {
        not = undefined;

        if (left === undefined) {
          left = compare.not(arg);
          continue;
        }

        right = arg;
        continue;
      }

      if (left === undefined) {
        left = arg;
        continue;
      }

      right = arg;
      break;
    }

    if (comparator) {
      if (compare[comparator]) {
        truthy = compare[comparator](left, right);
      }
      else {
        truthy = false;
      }
    }
    else {
      truthy = left;
    }

    return truthy;
  }

  // Run combyne on a nested partial template.
  function runPartial(self, method, args, obj, mode) {
    var _output, _mode, innerText;
    var stack = [];
    var name = args[0];
    var partial = self.partials.get(name);

    if (partial == null) {
      if (self.debug) {
        throw new Error("Partial " + name + " not found");
      }
    }
    else if (error = tokenizer(partial.template, stack)) {
      if (self.debug) {
        throw new Error(error);
      }
    }

    stack.reverse();

    // Save original output state and mode
    _output = output;
    _mode = mode.get();

    // Clear output and modes for the inner text
    output = "";
    mode.clear();

    // Parse the partial
    if (partial && partial.context) {
      innerText = render(self, partial.context, stack, _delimiters);
    }

    // Reset output and mode
    output = _output;
    mode.set(_mode);

    if (mode.exists("skip")) {
      mode.unset("skip");
    }

    return innerText || "";
  }

  var mode = function() {
    var modes = [];

    return {
      set: function(val) {
        modes = modes.concat(val);
      },
      get: function() {
        return modes;
      },
      unset: function(val) {
        modes.splice(modes.indexOf(val), 1);
      },
      exists: function(val) {
        return !!~modes.indexOf(val);
      },
      clear: function() {
        modes = [];
      },
      count: function(val) {
        var i, count = 0;

        for (i = 0; i < modes.length; i++) {
          if (modes[i] === val) {
            count = count + 1;
          }
        }

        return count;
      }
    };
  }();

  var loop = function() {
    var _mode, key, keys, stack, error, context;
    var loops = [];

    return {
      execArray: function(self, array, name, oldContext) {
        var i, iLen;

        _mode = mode.get();
        mode.unset("loop");

        if (array && array.length) {
          for (i=0, iLen=array.length; i<iLen; i++) {
            stack = [];

            if (error = tokenizer(innerText, stack)) {
              if (self.debug) {
                throw new Error(error);
              }
            }

            stack.reverse();

            // Ensure these required properties cannot be overwritten
            context = { i: i+1, length: iLen, original: array };
            context[name.index || "."] = array[i];

            if (typeof array[i] === "object") {
              context = proto(context, array[i]);
              array[i] = proto(array[i], oldContext);
            }
            else {
              context = proto(context, oldContext);
            }

            output = render(self, context, stack, _delimiters);
          }
        }
        mode.set(_mode);

        innerText = output;
      },

      execObj: function(self, obj, name, oldContext) {
        var i, iLen;

        _mode = mode.get();
        mode.unset("loop");

        keys = obj ? getKeys(obj) : [];
        if (keys.length) {
          for (i=0, iLen=keys.length; i<iLen; i++) {
            key = keys[i];
            stack = [];

            if (error = tokenizer(innerText, stack)) {
              if (self.debug) {
                throw new Error(error);
              }
            }

            stack.reverse();

            // Ensure these required properties cannot be overwritten
            context = { original: obj };
            context[name.key || "."] = key;
            context[name.obj || "original"] = obj;
            context[name.val || "$"] = obj[key];

            if (typeof obj[key] === "object") {
              context = proto(context, obj[key]);
              obj[key] = proto(obj[key], oldContext);
            }
            else {
              context = proto(context, oldContext);
            }
          
            output = render(self, context, stack, _delimiters);
          }
        }
        mode.set(_mode);
      },

      clear: function() {
        loops = [];
      }
    };
  }();

  return function(self, context, stack, delimiters) {
    var tmpVar, method, args;
    var token = stack.pop();
    var capture = token.captures[0];

    // Cache for later use
    _delimiters = delimiters || _delimiters;

    switch(token.name) {
      case "START_PROP":
        if (mode.exists("skip")) {
          break;
        }

        if (mode.exists("loop")) {
          innerText += capture;
          break;
        }

        mode.set("prop");

        break;

      case "END_PROP":
        if (mode.exists("skip")) {
          break;
        }

        if (mode.exists("loop")) {
          innerText += capture;
          break;
        }

        // Object is in context
        if (typeof obj !== "object") {
          output += obj;
        }

        mode.unset("prop");

        break;

      case "START_EXPR":
        mode.set("expr");

        if (mode.exists("loop")) {
          innerText += capture;
        }

        break;

      case "END_EXPR":
        mode.unset("expr");

        if (mode.exists("loop") || mode.exists("if")) {
          innerText += capture;
        }

        if (mode.exists("if") && mode.exists("pass")) {
          mode.unset("if");
        }
        
        if (mode.exists("skip")) {
          if (obj === "--" && mode.exists("skip")) {
            mode.unset("skip");
          }

          break;
        }

        if (mode.exists("partial")) {
          output += obj;
          mode.unset("partial");
        }

        if (obj === "endeach") {
          mode.unset("loop");
        }

        break;

      case "OTHER":
        if (mode.exists("prop")) {
          if (mode.exists("skip")) {
            break;
          }

          if (mode.exists("loop")) {
            innerText += capture;
            break;
          }

          obj = normalizeArgument(capture, context)

          if (obj == null) {
            obj = { prop: capture }; 
          }
        }
        else if (mode.exists("filter")) {
          if (mode.exists("skip")) {
            break;
          }

          if (mode.exists("loop")) {
            innerText += capture;
            break;
          }

          tmpVar = capture.split(" ");
          method = tmpVar.shift();
          args = tmpVar;

          obj = runFilter(self, method, args, obj, context, mode);
          mode.set("string");
        }
        else if (mode.exists("expr")) {
          tmpVar = capture.split(" ");
          method = tmpVar.shift();
          args = tmpVar;

          if (method === "if" || method === "elsif") {
            mode.set("if");

            if (method !== "elsif") {
              if (mode.exists("fail") || mode.exists("skip")) {
                mode.unset("fail");
                break;
              }
            }
            else {
              if (mode.exists("fail")) { mode.unset("fail"); }
              if (mode.exists("pass")) { mode.unset("pass"); }
            }

            if (mode.exists("loop")) {
              innerText += capture;
              break;
            }

            if (args.length < 1) {
              if (self.debug) {
                throw new Error("No arguments supplied for if statement");
              }
            }
            else if (args.length === 1) {
              if (!normalizeArgument(args[0], context)) {
                mode.set("skip");
                mode.set("fail");
              }
              else {
                mode.set("pass");

                if (mode.exists("skip")) {
                  mode.unset("skip");
                }
              }
            }
            else {
              if (!runConditional(self, args, context)) {
                mode.set("skip");
                mode.set("fail");
              }
              else {
                mode.set("pass");

                if (mode.exists("skip")) {
                  mode.unset("skip");
                }
              }
            }
          }
          else if (method === "else") {
            if (mode.count("if") === 1 && !mode.exists("pass") && mode.exists("skip")) {
              mode.unset("skip");
            }
            else {
              if (!mode.exists("pass") && !mode.exists("skip")) {
                innerText += capture;
              }

              if (mode.count("fail") < mode.count("pass")) {
                mode.set("skip");
                break;
              }

              if (mode.exists("fail") || mode.exists("pass")) {
                mode.unset("skip");
              }
            }
          }
          else if (method === "endif") {
            if (mode.exists("skip")) {
              mode.unset("skip"); 
            }

            if (mode.exists("pass")) {
              mode.unset("pass");
            }

            if (mode.exists("fail")) {
              mode.unset("fail");
            }

            if (mode.exists("loop")) {
              innerText += capture;
            }
          }
          else if (method === "each") {
            if (mode.exists("skip")) {
              break;
            }

            if (mode.exists("loop")) {
              mode.set("loop");
              innerText += capture;
              break;
            }

            mode.set("loop");

            if (args.length < 1) {
              if (self.debug) {
                throw new Error("No arguments supplied for each statement");
              }
            }
            // Iterating an array
            else if (toString.call(context[args[0]]) == "[object Array]") {
              names = {};

              obj = context[args[0]];
              names["index"] = args[2];
              innerText = "";
            }
            // Iterating an object
            else {
              names = {};

              if (context[args[0]]) {
                obj = context[args[0]];
                names["obj"] = args[0];
                names["key"] = args[2];
                names["val"] = args[3];
                innerText = "";
              }
            }
          }
          else if (method === "endeach") {
            if (mode.exists("skip")) {
              break;
            }

            mode.unset("loop");
            if (!mode.exists("loop")) {
              if (toString.call(obj) == "[object Array]") {
                loop.execArray(self, obj, names, context);
              }
              else {
                loop.execObj(self, obj, names, context);
              }

              loop.clear();
            }
            else {
              if (mode.exists("loop")) {
                innerText += capture + delimiters.END_EXPR;
                break;
              }
            }
          }
          else if (method === "partial") {
            if (mode.exists("skip")) {
              break;
            }

            if (mode.exists("loop")) {
              innerText += capture;
              break;
            }

            tmpVar = capture.split(" ");
            method = tmpVar.shift();
            args = tmpVar;

            obj = runPartial(self, method, args, obj, mode);
            mode.set("partial");
          }
        }
        else {
          if (mode.exists("skip")) {
            break;
          }

          if (mode.exists("loop")) {
            innerText += capture;
            break;
          }

          output += capture;
        }

        break;
      
      case "WHITESPACE":
        if (mode.exists("skip")) {
          break;
        }

        if (mode.exists("loop")) {
          innerText += capture;
          break;
        }

        output += capture;

        break;

      case "FILTER":
        if (mode.exists("skip")) {
          break;
        }

        if (mode.exists("loop")) {
          innerText += capture;
          break;
        }

        if (!mode.exists("prop") && !mode.exists("expr") && !mode.exists("string")) {
          output += capture;
          break;
        }

        mode.unset("prop");
        mode.set("filter");

        break;

      case "COMMENT":
        if (mode.exists("skip")) {
          obj = "--";
          break;
        }

        if (mode.exists("loop")) {
          innerText += capture;
          break;
        }

        if (mode.exists("expr")) {
          mode.set("skip");
        }
        else {
          output += delimiters.COMMENT;
        }

        break;
    }

    if (stack.length) {
      return render(self, context, stack, delimiters);
    }

    // Store output before resetting scope
    retVal = output;

    // Reset outer scope
    mode.clear();
    output = "";
    obj = undefined;

    // Return value
    return retVal;
  };
}();

var main = function() {

  return function(self, template, context, delimiters) {
    var string, sp, ep, se, ee, co, fi;
    var error = 0;
    var stack = [];
    var grammar = {};

    sp = escDelimiter(delimiters.START_PROP);
    ep = escDelimiter(delimiters.END_PROP);
    se = escDelimiter(delimiters.START_EXPR);
    ee = escDelimiter(delimiters.END_EXPR);
    co = escDelimiter(delimiters.COMMENT);
    fi = escDelimiter(delimiters.FILTER);

    grammar.START_PROP = RegExp("^" + sp);
    grammar.END_PROP = RegExp("^" + ep);
    grammar.START_EXPR = RegExp("^" + se);
    grammar.END_EXPR = RegExp("^" + ee);
    grammar.COMMENT = RegExp("^" + co);
    grammar.FILTER = RegExp("^" + fi);

    string = [ sp, ep, se, ee, co, fi ].join("|");

    grammar.WHITESPACE = /^[\ |\t|\r|\n]+/,
    grammar.OTHER = RegExp("^((?!" + string + ").)*");

    if (error = tokenizer(template, stack, grammar)) {
      if (self.debug) {
        throw new Error(error);
      }
    }

    stack.reverse();

    return render(self, context, stack, delimiters);
  };
}();

function combyne(template, context) {
  if(!(this instanceof combyne)) {
    return new combyne(template, context);
  }

  this.template = template;
  this.context = context || {};

  function addon() {
    return {
      _cache: {},
      // Read
      get: function(name) {
        return this._cache[name];
      },
      // Delete
      remove: function(name) {
        delete this._cache[name];
      }
    };
  }

  this.filters = addon();
  this.filters.add = function(name, cb) {
    this._cache[name] = _wrapFilter(cb);
  };

  this.partials = addon();
  this.partials.add = function(name, template, context) {
    this._cache[name] = { template: template, context: context };
  };
}

combyne.version = "0.1.7";
combyne.prototype = {
  render: function(context) {
    var self = this;

    // Maintain backwards compatibility
    self.context = context || self.context;

    // Missing template or context... can't exactly do anything here...
    if (!self.template || !self.context) {
      if (self.debug) {
        throw new Error("Missing template or context");
      }
    } 

    // Override delimiters
    self.delimiters = self.delimiters || {};
    self.delimiters = proto(self.delimiters, {
      START_PROP: "{{",
      END_PROP: "}}",
      START_EXPR: "{%",
      END_EXPR: "%}",
      COMMENT: "--",
      FILTER: "|"
    });

    // Actually render
    return main(self, self.template, self.context, self.delimiters);
  },

  delimiters: {}
};

function _wrapFilter(func) {
  var self = this;
  var context;

  return function() {
    context = context ? context : { original: self.template };

    return func.apply(context, arguments);
  };
}

// Attempt to attach specifically for Node.js projects.
// Allows: var combyne = require("combyne");
if (typeof module !== "undefined" && module.exports) {
  module.exports = combyne;

  // Express Support
  module.exports.compile = function(markup) {
    return function(locals) {
      return combyne(markup, locals).render();
    };
  }
}
else {
  window.combyne = combyne;
}


// Allow attaching to exports property
})(this.exports || this);
