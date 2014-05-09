(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var registerPartial = require('./shared/register_partial');
var registerFilter = require('./shared/register_filter');
var type = require('./utils/type');
var map = require('./utils/map');
var createObject = require('./utils/create_object');
var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
var escapes = {
        '\'': '\'',
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\t': 't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };
function escapeValue(value) {
    return value.replace(escaper, function (match) {
        return '\\' + escapes[match];
    });
}
function normalizeIdentifier(identifier) {
    if (identifier === '.') {
        return 'data[\'.\']';
    }
    return 'data' + identifier.split('.').map(function (property) {
        return '[\'' + property + '\']';
    }).join('');
}
function Compiler(tree) {
    this.tree = tree;
    this.string = '';
    var compiledSource = this.process(this.tree.body);
    var body = [];
    if (compiledSource) {
        compiledSource = ' + ' + compiledSource;
    }
    if (compiledSource.indexOf('map(') > -1) {
        body.push(createObject, type, map);
    }
    body = body.concat(['return \'\'' + compiledSource]).join(';\n');
    this.func = new Function('data', 'partials', 'filters', body);
    this.source = [
        '{',
        '_partials: {},',
        '_filters: {},',
        'registerPartial: ' + registerPartial + ',',
        'registerFilter: ' + registerFilter + ',',
        'render: function(data) {',
        'return ' + this.func + '(data, this._partials, this._filters)',
        '}',
        '}'
    ].join('\n');
}
Compiler.prototype.process = function (body) {
    var commands = [];
    body.forEach(function (entry) {
        switch (entry.type) {
        case 'Property': {
                commands.push(this.compileProperty(entry));
                break;
            }
        case 'ConditionalExpression': {
                commands.push(this.compileConditional(entry));
                break;
            }
        case 'LoopExpression': {
                commands.push(this.compileLoop(entry));
                break;
            }
        case 'PartialExpression': {
                commands.push(this.compilePartial(entry));
                break;
            }
        default: {
                commands.push('\'' + escapeValue(entry.value) + '\'');
            }
        }
    }, this);
    return commands.join('+');
};
Compiler.prototype.compileProperty = function (entry) {
    var identifier = entry.value;
    if (identifier.indexOf('\'') === -1 && identifier.indexOf('"') === -1) {
        identifier = normalizeIdentifier(entry.value);
    }
    var value = [
            '(',
            'typeof',
            identifier,
            '===',
            '\'function\'',
            '?',
            identifier + '()',
            ':',
            identifier,
            ')'
        ].join(' ');
    value = entry.filters.reduce(function (memo, filter) {
        var args = filter.args.length ? ', ' + filter.args.join(', ') : '';
        return 'filters[\'' + filter.value + '\']' + '(' + memo + args + ')';
    }, value);
    return value;
};
Compiler.prototype.compileConditional = function (entry) {
    if (entry.conditions.length === 0) {
        throw new Error('Missing conditions to if statement.');
    }
    var condition = entry.conditions.map(function (condition) {
            switch (condition.type) {
            case 'Identifier': {
                    return normalizeIdentifier(condition.value);
                }
            case 'Not': {
                    return '!';
                }
            case 'Literal': {
                    return condition.value;
                }
            case 'Equality': {
                    return condition.value;
                }
            }
        }).join(' ');
    var els = entry.els ? this.process(entry.els.body) : null;
    var elsif = entry.elsif ? this.compileConditional(entry.elsif) : null;
    return [
        '(',
        '(',
        condition,
        ')',
        '?',
        this.process(entry.body),
        ':',
        els || elsif || '\'\'',
        ')'
    ].join('');
};
Compiler.prototype.compileLoop = function (entry) {
    var keyVal = [
            entry.conditions[3] ? entry.conditions[3].value : 'i',
            entry.conditions[2] ? entry.conditions[2].value : '.'
        ];
    var loop = [
            'map(',
            normalizeIdentifier(entry.conditions[0].value),
            ',',
            '\'',
            keyVal[0],
            '\'',
            ',',
            '\'',
            keyVal[1],
            '\'',
            ',',
            'data',
            ',',
            'function(data) {',
            'return ' + this.process(entry.body, keyVal),
            '}',
            ').join(\'\')'
        ].join('');
    return loop;
};
Compiler.prototype.compilePartial = function (entry) {
    return [
        '(',
        'partials[\'' + entry.value + '\'].render(',
        entry.args.length ? normalizeIdentifier(entry.args[0]) : 'null',
        ')',
        ')'
    ].join('');
};
module.exports = Compiler;
},{"./shared/register_filter":4,"./shared/register_partial":5,"./utils/create_object":8,"./utils/map":10,"./utils/type":12}],2:[function(require,module,exports){
'use strict';
var escapeDelimiter = require('./utils/escape_delimiter');
var objectKeys = require('./utils/object_keys');
function Grammar(delimiters) {
    this.delimiters = delimiters;
    this.internal = [
        makeEntry('START_IF', 'if'),
        makeEntry('ELSE', 'else'),
        makeEntry('ELSIF', 'elsif'),
        makeEntry('END_IF', 'endif'),
        makeEntry('NOT', 'not'),
        makeEntry('EQUALITY', '=='),
        makeEntry('NOT_EQUALITY', '!='),
        makeEntry('GREATER_THAN_EQUAL', '>='),
        makeEntry('GREATER_THAN', '>'),
        makeEntry('LESS_THAN_EQUAL', '<='),
        makeEntry('LESS_THAN', '<'),
        makeEntry('NOT', 'not'),
        makeEntry('START_EACH', 'each'),
        makeEntry('END_EACH', 'endeach'),
        makeEntry('ASSIGN', 'as'),
        makeEntry('PARTIAL', 'partial'),
        makeEntry('MAGIC', '.')
    ];
}
function makeEntry(name, value) {
    var escaped = escapeDelimiter(value);
    return {
        name: name,
        escaped: escaped,
        test: new RegExp('^' + escaped)
    };
}
Grammar.prototype.escape = function () {
    var keys = objectKeys(this.delimiters);
    var grammar = [];
    keys.forEach(function (key) {
        grammar.push(makeEntry(key, this.delimiters[key]));
    }, this);
    grammar.push.apply(grammar, this.internal);
    var string = grammar.map(function (value) {
            return value.escaped;
        }).join('|');
    grammar.push({
        name: 'WHITESPACE',
        test: /^[\ |\t|\r|\n]+/
    });
    string += '| |\t|\r|\n';
    grammar.push({
        name: 'OTHER',
        test: new RegExp('^((?!' + string + ').)*')
    });
    return grammar;
};
module.exports = Grammar;
},{"./utils/escape_delimiter":9,"./utils/object_keys":11}],3:[function(require,module,exports){
'use strict';
var Grammar = require('./grammar');
var Tokenizer = require('./tokenizer');
var Tree = require('./tree');
var Compiler = require('./compiler');
var registerPartial = require('./shared/register_partial');
var registerFilter = require('./shared/register_filter');
var type = require('./utils/type');
function Combyne(template, data) {
    if (!(this instanceof Combyne)) {
        return new Combyne(template, data);
    }
    this.template = template;
    this.data = data || {};
    this._partials = {};
    this._filters = {};
    if (type(this.template) !== 'string') {
        throw new Error('Template must be a String.');
    }
    this._refresh(Combyne.settings.delimiters);
}
Combyne.prototype._refresh = function (delimiters) {
    var grammar = new Grammar(delimiters).escape();
    var stack = new Tokenizer(this.template, grammar).parse();
    var tree = new Tree(stack).make();
    this.tree = tree;
    this.stack = stack;
    this.compiler = new Compiler(tree);
    this.source = this.compiler.source;
};
Combyne.prototype.setDelimiters = function (local) {
    var delimiters = {};
    function inherits(name) {
        return local[name] || Combyne.settings.delimiters[name];
    }
    delimiters = {
        START_PROP: inherits('START_PROP'),
        END_PROP: inherits('END_PROP'),
        START_EXPR: inherits('START_EXPR'),
        END_EXPR: inherits('END_EXPR'),
        COMMENT: inherits('COMMENT'),
        FILTER: inherits('FILTER')
    };
    this._refresh(delimiters);
};
Combyne.prototype.registerPartial = registerPartial;
Combyne.prototype.registerFilter = registerFilter;
Combyne.settings = {
    delimiters: {
        START_PROP: '{{',
        END_PROP: '}}',
        START_EXPR: '{%',
        END_EXPR: '%}',
        COMMENT: '--',
        FILTER: '|'
    }
};
Combyne.prototype.render = function (data) {
    this.data = data || this.data;
    return this.compiler.func(this.data, this._partials, this._filters);
};
Combyne.VERSION = '0.3.1';
module.exports = Combyne;
},{"./compiler":1,"./grammar":2,"./shared/register_filter":4,"./shared/register_partial":5,"./tokenizer":6,"./tree":7,"./utils/type":12}],4:[function(require,module,exports){
'use strict';
var registerFilter = function (name, callback) {
    this._filters[name] = callback;
};
module.exports = registerFilter;
},{}],5:[function(require,module,exports){
'use strict';
var registerPartial = function (name, template) {
    this._partials[name] = template;
    this._partials[name]._filters = this._filters;
};
module.exports = registerPartial;
},{}],6:[function(require,module,exports){
'use strict';
function Tokenizer(template, grammar) {
    this.template = template;
    this.grammar = grammar;
    this.stack = [];
}
function parseNextToken(template, grammar, stack) {
    grammar.some(function (token) {
        var capture = token.test.exec(template);
        if (capture && capture[0]) {
            template = template.replace(token.test, '');
            stack.push({
                name: token.name,
                capture: capture
            });
            return true;
        }
    });
    return template;
}
Tokenizer.prototype.parse = function () {
    var template = this.template;
    var grammar = this.grammar;
    var stack = this.stack;
    var stackLen = 0;
    while (template.length) {
        template = parseNextToken(template, grammar, stack);
        stackLen = stack.length;
        if (stackLen - 2 >= 0) {
            stack[stackLen - 1].previous = stack[stackLen - 2];
        }
    }
    return stack;
};
module.exports = Tokenizer;
},{}],7:[function(require,module,exports){
'use strict';
var isString = /['"]+/;
function Tree(stack) {
    this.stack = stack.slice();
    this.root = {
        type: 'Template',
        body: []
    };
}
Tree.prototype.constructProperty = function () {
    var propertyDescriptor = {
            type: 'Property',
            value: '',
            filters: []
        };
    while (this.stack.length) {
        var entry = this.stack.shift();
        switch (entry.name) {
        case 'WHITESPACE': {
                break;
            }
        case 'FILTER': {
                return this.constructFilter(propertyDescriptor);
            }
        case 'END_PROP': {
                return propertyDescriptor;
            }
        default: {
                propertyDescriptor.value += entry.capture[0].trim();
            }
        }
    }
    throw new Error('Unterminated property.');
};
Tree.prototype.constructPartial = function (root) {
    root.type = 'PartialExpression';
    delete root.body;
    root.args = [];
    LOOP:
        while (this.stack.length) {
            var entry = this.stack.shift();
            switch (entry.name) {
            case 'OTHER': {
                    if (root.value === undefined) {
                        root.value = entry.capture[0].trim();
                    } else {
                        root.args.push(entry.capture[0].trim());
                    }
                    break;
                }
            case 'WHITESPACE': {
                    break;
                }
            case 'END_EXPR': {
                    break LOOP;
                }
            default: {
                    throw new Error('Unexpected ' + entry.name + ' encountered.');
                }
            }
        }
    return root;
};
Tree.prototype.constructFilter = function (root) {
    var current = {
            type: 'Filter',
            args: []
        };
    var previous = {};
    LOOP:
        while (this.stack.length) {
            var entry = this.stack.shift();
            switch (entry.name) {
            case 'OTHER': {
                    if (current.value === undefined) {
                        current.value = entry.capture[0].trim();
                    } else {
                        current.args.push(entry.capture[0].trim());
                    }
                    break;
                }
            case 'WHITESPACE': {
                    break;
                }
            case 'END_PROP': {
                    root.filters.push(current);
                    break LOOP;
                }
            case 'FILTER': {
                    root.filters.push(current);
                    this.constructFilter(root);
                    break;
                }
            default: {
                    throw new Error('Unexpected ' + entry.name + ' encountered.');
                }
            }
            previous = entry;
        }
    return root;
};
Tree.prototype.constructEach = function (root) {
    root.type = 'LoopExpression';
    root.conditions = [];
    LOOP:
        while (this.stack.length) {
            var entry = this.stack.shift();
            switch (entry.name) {
            case 'OTHER': {
                    root.conditions.push({
                        type: 'Identifier',
                        value: entry.capture[0].trim()
                    });
                    break;
                }
            case 'ASSIGN': {
                    root.conditions.push({
                        type: 'Assignment',
                        value: entry.capture[0].trim()
                    });
                    break;
                }
            case 'END_EXPR': {
                    break LOOP;
                }
            }
        }
    this.make(root, 'END_EACH');
    return root;
};
Tree.prototype.constructComment = function (root) {
    var previous = {};
    while (this.stack.length) {
        var entry = this.stack.shift();
        switch (entry.name) {
        case 'COMMENT': {
                if (previous.name === 'START_EXPR') {
                    this.constructComment(root);
                    break;
                }
                break;
            }
        case 'END_EXPR': {
                if (previous.name === 'COMMENT') {
                    return false;
                }
                break;
            }
        }
        previous = entry;
    }
    return false;
};
Tree.prototype.constructConditional = function (root, kind) {
    root.type = root.type || 'ConditionalExpression';
    root.conditions = root.conditions || [];
    var previous = {};
    if (kind === 'ELSE') {
        root.els = { body: [] };
        return this.make(root.els, 'END_IF');
    }
    if (kind === 'ELSIF') {
        root.elsif = { body: [] };
        return this.constructConditional(root.elsif);
    }
    LOOP:
        while (this.stack.length) {
            var entry = this.stack.shift();
            var value = entry.capture[0].trim();
            switch (entry.name) {
            case 'NOT': {
                    root.conditions.push({ type: 'Not' });
                    break;
                }
            case 'EQUALITY':
            case 'NOT_EQUALITY':
            case 'GREATER_THAN':
            case 'GREATER_THAN_EQUAL':
            case 'LESS_THAN':
            case 'LESS_THAN_EQUAL': {
                    root.conditions.push({
                        type: 'Equality',
                        value: entry.capture[0].trim()
                    });
                    break;
                }
            case 'END_EXPR': {
                    break LOOP;
                }
            case 'WHITESPACE': {
                    break;
                }
            default: {
                    if (value === 'false' || value === 'true') {
                        root.conditions.push({
                            type: 'Literal',
                            value: value
                        });
                        break;
                    } else if (Number(value) === Number(value)) {
                        root.conditions.push({
                            type: 'Literal',
                            value: value
                        });
                    } else if (isString.test(value)) {
                        root.conditions.push({
                            type: 'Literal',
                            value: value
                        });
                        break;
                    } else if (previous.type === 'Identifier') {
                        previous.value += value;
                        break;
                    } else {
                        root.conditions.push({
                            type: 'Identifier',
                            value: value
                        });
                        break;
                    }
                }
            }
            previous = root.conditions[root.conditions.length - 1] || {};
        }
    this.make(root, 'END_IF');
    return root;
};
Tree.prototype.constructExpression = function (root, END) {
    var expressionRoot = { body: [] };
    while (this.stack.length) {
        var type = this.stack.shift();
        switch (type.name) {
        case END: {
                return;
            }
        case 'WHITESPACE': {
                break;
            }
        case 'COMMENT': {
                return this.constructComment(expressionRoot);
            }
        case 'START_EACH': {
                return this.constructEach(expressionRoot);
            }
        case 'ELSIF':
        case 'ELSE':
        case 'START_IF': {
                if (type.name !== 'START_IF') {
                    expressionRoot = root;
                }
                return this.constructConditional(expressionRoot, type.name);
            }
        case 'PARTIAL': {
                return this.constructPartial(expressionRoot);
            }
        default: {
                throw new Error('Invalid expression type.');
            }
        }
    }
};
Tree.prototype.make = function (root, END) {
    root = root || this.root;
    var result;
    while (this.stack.length) {
        var entry = this.stack.shift();
        var prev = root.body[root.body.length - 1];
        switch (entry.name) {
        case 'START_PROP': {
                root.body.push(this.constructProperty());
                break;
            }
        case 'START_EXPR': {
                if (result = this.constructExpression(root, END)) {
                    root.body.push(result);
                    break;
                } else if (result !== false) {
                    return;
                }
                break;
            }
        case 'END_EXPR': {
                break;
            }
        default: {
                var prevWhitespace = '';
                if (prev && prev.type === 'Text') {
                    root.body.pop();
                    prevWhitespace = prev.value;
                }
                root.body.push({
                    type: 'Text',
                    value: prevWhitespace + entry.capture[0]
                });
                break;
            }
        }
    }
    return root;
};
module.exports = Tree;
},{}],8:[function(require,module,exports){
'use strict';
function createObject(parent) {
    function F() {
    }
    F.prototype = parent;
    return new F();
}
module.exports = createObject;
},{}],9:[function(require,module,exports){
'use strict';
var specialCharsExp = /[\^$\\\/.*+?()\[\]{}|]/g;
function escapeDelimiter(delimiter) {
    return delimiter.replace(specialCharsExp, '\\$&');
}
module.exports = escapeDelimiter;
},{}],10:[function(require,module,exports){
'use strict';
var type = require('./type');
var createObject = require('./create_object');
function map(obj, index, value, data, iterator) {
    var isArrayLike = type(obj) === 'arguments' || type(obj) === 'nodelist';
    var isArray = Array.isArray(obj) || isArrayLike;
    var output = [];
    var i;
    var dataObject;
    if (isArray) {
        obj = [].slice.call(obj);
        for (i = 0; i < obj.length; i++) {
            dataObject = createObject(data);
            dataObject[index] = i;
            dataObject[value] = obj[i];
            output.push(iterator(dataObject));
        }
        return output;
    } else {
        for (i in obj) {
            if (!obj.hasOwnProperty(i)) {
                continue;
            }
            dataObject = createObject(data);
            dataObject[index] = i;
            dataObject[value] = obj[i];
            output.push(iterator(dataObject));
        }
        return output;
    }
}
module.exports = map;
},{"./create_object":8,"./type":12}],11:[function(require,module,exports){
'use strict';
function objectKeys(object) {
    var keys = [];
    for (var key in object) {
        if (!object.hasOwnProperty(key)) {
            continue;
        }
        keys.push(key);
    }
    return keys;
}
module.exports = objectKeys;
},{}],12:[function(require,module,exports){
'use strict';
var toString = Object.prototype.toString;
function type(value) {
    return toString.call(value).slice(8, -1).toLowerCase();
}
module.exports = type;
},{}]},{},[3])