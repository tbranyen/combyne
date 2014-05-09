!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.combyne=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';
var registerPartial = _dereq_('./shared/register_partial');
var registerFilter = _dereq_('./shared/register_filter');
var type = _dereq_('./utils/type');
var map = _dereq_('./utils/map');
var createObject = _dereq_('./utils/create_object');
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
},{"./shared/register_filter":4,"./shared/register_partial":5,"./utils/create_object":8,"./utils/map":10,"./utils/type":12}],2:[function(_dereq_,module,exports){
'use strict';
var escapeDelimiter = _dereq_('./utils/escape_delimiter');
var objectKeys = _dereq_('./utils/object_keys');
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
},{"./utils/escape_delimiter":9,"./utils/object_keys":11}],3:[function(_dereq_,module,exports){
'use strict';
var Grammar = _dereq_('./grammar');
var Tokenizer = _dereq_('./tokenizer');
var Tree = _dereq_('./tree');
var Compiler = _dereq_('./compiler');
var registerPartial = _dereq_('./shared/register_partial');
var registerFilter = _dereq_('./shared/register_filter');
var type = _dereq_('./utils/type');
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
},{"./compiler":1,"./grammar":2,"./shared/register_filter":4,"./shared/register_partial":5,"./tokenizer":6,"./tree":7,"./utils/type":12}],4:[function(_dereq_,module,exports){
'use strict';
var registerFilter = function (name, callback) {
    this._filters[name] = callback;
};
module.exports = registerFilter;
},{}],5:[function(_dereq_,module,exports){
'use strict';
var registerPartial = function (name, template) {
    this._partials[name] = template;
    this._partials[name]._filters = this._filters;
};
module.exports = registerPartial;
},{}],6:[function(_dereq_,module,exports){
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
},{}],7:[function(_dereq_,module,exports){
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
},{}],8:[function(_dereq_,module,exports){
'use strict';
function createObject(parent) {
    function F() {
    }
    F.prototype = parent;
    return new F();
}
module.exports = createObject;
},{}],9:[function(_dereq_,module,exports){
'use strict';
var specialCharsExp = /[\^$\\\/.*+?()\[\]{}|]/g;
function escapeDelimiter(delimiter) {
    return delimiter.replace(specialCharsExp, '\\$&');
}
module.exports = escapeDelimiter;
},{}],10:[function(_dereq_,module,exports){
'use strict';
var type = _dereq_('./type');
var createObject = _dereq_('./create_object');
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
},{"./create_object":8,"./type":12}],11:[function(_dereq_,module,exports){
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
},{}],12:[function(_dereq_,module,exports){
'use strict';
var toString = Object.prototype.toString;
function type(value) {
    return toString.call(value).slice(8, -1).toLowerCase();
}
module.exports = type;
},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvaG9tZS90aW0vZ2l0L2NvbWJ5bmUvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9ob21lL3RpbS9naXQvY29tYnluZS9saWIvY29tcGlsZXIuanMiLCIvaG9tZS90aW0vZ2l0L2NvbWJ5bmUvbGliL2dyYW1tYXIuanMiLCIvaG9tZS90aW0vZ2l0L2NvbWJ5bmUvbGliL2luZGV4LmpzIiwiL2hvbWUvdGltL2dpdC9jb21ieW5lL2xpYi9zaGFyZWQvcmVnaXN0ZXJfZmlsdGVyLmpzIiwiL2hvbWUvdGltL2dpdC9jb21ieW5lL2xpYi9zaGFyZWQvcmVnaXN0ZXJfcGFydGlhbC5qcyIsIi9ob21lL3RpbS9naXQvY29tYnluZS9saWIvdG9rZW5pemVyLmpzIiwiL2hvbWUvdGltL2dpdC9jb21ieW5lL2xpYi90cmVlLmpzIiwiL2hvbWUvdGltL2dpdC9jb21ieW5lL2xpYi91dGlscy9jcmVhdGVfb2JqZWN0LmpzIiwiL2hvbWUvdGltL2dpdC9jb21ieW5lL2xpYi91dGlscy9lc2NhcGVfZGVsaW1pdGVyLmpzIiwiL2hvbWUvdGltL2dpdC9jb21ieW5lL2xpYi91dGlscy9tYXAuanMiLCIvaG9tZS90aW0vZ2l0L2NvbWJ5bmUvbGliL3V0aWxzL29iamVjdF9rZXlzLmpzIiwiL2hvbWUvdGltL2dpdC9jb21ieW5lL2xpYi91dGlscy90eXBlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHJlZ2lzdGVyUGFydGlhbCA9IHJlcXVpcmUoJy4vc2hhcmVkL3JlZ2lzdGVyX3BhcnRpYWwnKTtcbnZhciByZWdpc3RlckZpbHRlciA9IHJlcXVpcmUoJy4vc2hhcmVkL3JlZ2lzdGVyX2ZpbHRlcicpO1xudmFyIHR5cGUgPSByZXF1aXJlKCcuL3V0aWxzL3R5cGUnKTtcbnZhciBtYXAgPSByZXF1aXJlKCcuL3V0aWxzL21hcCcpO1xudmFyIGNyZWF0ZU9iamVjdCA9IHJlcXVpcmUoJy4vdXRpbHMvY3JlYXRlX29iamVjdCcpO1xudmFyIGVzY2FwZXIgPSAvXFxcXHwnfFxccnxcXG58XFx0fFxcdTIwMjh8XFx1MjAyOS9nO1xudmFyIGVzY2FwZXMgPSB7XG4gICAgICAgICdcXCcnOiAnXFwnJyxcbiAgICAgICAgJ1xcXFwnOiAnXFxcXCcsXG4gICAgICAgICdcXHInOiAncicsXG4gICAgICAgICdcXG4nOiAnbicsXG4gICAgICAgICdcXHQnOiAndCcsXG4gICAgICAgICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgICAgICAgJ1xcdTIwMjknOiAndTIwMjknXG4gICAgfTtcbmZ1bmN0aW9uIGVzY2FwZVZhbHVlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoZXNjYXBlciwgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgIHJldHVybiAnXFxcXCcgKyBlc2NhcGVzW21hdGNoXTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIG5vcm1hbGl6ZUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICAgIGlmIChpZGVudGlmaWVyID09PSAnLicpIHtcbiAgICAgICAgcmV0dXJuICdkYXRhW1xcJy5cXCddJztcbiAgICB9XG4gICAgcmV0dXJuICdkYXRhJyArIGlkZW50aWZpZXIuc3BsaXQoJy4nKS5tYXAoZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gICAgICAgIHJldHVybiAnW1xcJycgKyBwcm9wZXJ0eSArICdcXCddJztcbiAgICB9KS5qb2luKCcnKTtcbn1cbmZ1bmN0aW9uIENvbXBpbGVyKHRyZWUpIHtcbiAgICB0aGlzLnRyZWUgPSB0cmVlO1xuICAgIHRoaXMuc3RyaW5nID0gJyc7XG4gICAgdmFyIGNvbXBpbGVkU291cmNlID0gdGhpcy5wcm9jZXNzKHRoaXMudHJlZS5ib2R5KTtcbiAgICB2YXIgYm9keSA9IFtdO1xuICAgIGlmIChjb21waWxlZFNvdXJjZSkge1xuICAgICAgICBjb21waWxlZFNvdXJjZSA9ICcgKyAnICsgY29tcGlsZWRTb3VyY2U7XG4gICAgfVxuICAgIGlmIChjb21waWxlZFNvdXJjZS5pbmRleE9mKCdtYXAoJykgPiAtMSkge1xuICAgICAgICBib2R5LnB1c2goY3JlYXRlT2JqZWN0LCB0eXBlLCBtYXApO1xuICAgIH1cbiAgICBib2R5ID0gYm9keS5jb25jYXQoWydyZXR1cm4gXFwnXFwnJyArIGNvbXBpbGVkU291cmNlXSkuam9pbignO1xcbicpO1xuICAgIHRoaXMuZnVuYyA9IG5ldyBGdW5jdGlvbignZGF0YScsICdwYXJ0aWFscycsICdmaWx0ZXJzJywgYm9keSk7XG4gICAgdGhpcy5zb3VyY2UgPSBbXG4gICAgICAgICd7JyxcbiAgICAgICAgJ19wYXJ0aWFsczoge30sJyxcbiAgICAgICAgJ19maWx0ZXJzOiB7fSwnLFxuICAgICAgICAncmVnaXN0ZXJQYXJ0aWFsOiAnICsgcmVnaXN0ZXJQYXJ0aWFsICsgJywnLFxuICAgICAgICAncmVnaXN0ZXJGaWx0ZXI6ICcgKyByZWdpc3RlckZpbHRlciArICcsJyxcbiAgICAgICAgJ3JlbmRlcjogZnVuY3Rpb24oZGF0YSkgeycsXG4gICAgICAgICdyZXR1cm4gJyArIHRoaXMuZnVuYyArICcoZGF0YSwgdGhpcy5fcGFydGlhbHMsIHRoaXMuX2ZpbHRlcnMpJyxcbiAgICAgICAgJ30nLFxuICAgICAgICAnfSdcbiAgICBdLmpvaW4oJ1xcbicpO1xufVxuQ29tcGlsZXIucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbiAoYm9keSkge1xuICAgIHZhciBjb21tYW5kcyA9IFtdO1xuICAgIGJvZHkuZm9yRWFjaChmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgc3dpdGNoIChlbnRyeS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ1Byb3BlcnR5Jzoge1xuICAgICAgICAgICAgICAgIGNvbW1hbmRzLnB1c2godGhpcy5jb21waWxlUHJvcGVydHkoZW50cnkpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnQ29uZGl0aW9uYWxFeHByZXNzaW9uJzoge1xuICAgICAgICAgICAgICAgIGNvbW1hbmRzLnB1c2godGhpcy5jb21waWxlQ29uZGl0aW9uYWwoZW50cnkpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnTG9vcEV4cHJlc3Npb24nOiB7XG4gICAgICAgICAgICAgICAgY29tbWFuZHMucHVzaCh0aGlzLmNvbXBpbGVMb29wKGVudHJ5KSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ1BhcnRpYWxFeHByZXNzaW9uJzoge1xuICAgICAgICAgICAgICAgIGNvbW1hbmRzLnB1c2godGhpcy5jb21waWxlUGFydGlhbChlbnRyeSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgY29tbWFuZHMucHVzaCgnXFwnJyArIGVzY2FwZVZhbHVlKGVudHJ5LnZhbHVlKSArICdcXCcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICAgIHJldHVybiBjb21tYW5kcy5qb2luKCcrJyk7XG59O1xuQ29tcGlsZXIucHJvdG90eXBlLmNvbXBpbGVQcm9wZXJ0eSA9IGZ1bmN0aW9uIChlbnRyeSkge1xuICAgIHZhciBpZGVudGlmaWVyID0gZW50cnkudmFsdWU7XG4gICAgaWYgKGlkZW50aWZpZXIuaW5kZXhPZignXFwnJykgPT09IC0xICYmIGlkZW50aWZpZXIuaW5kZXhPZignXCInKSA9PT0gLTEpIHtcbiAgICAgICAgaWRlbnRpZmllciA9IG5vcm1hbGl6ZUlkZW50aWZpZXIoZW50cnkudmFsdWUpO1xuICAgIH1cbiAgICB2YXIgdmFsdWUgPSBbXG4gICAgICAgICAgICAnKCcsXG4gICAgICAgICAgICAndHlwZW9mJyxcbiAgICAgICAgICAgIGlkZW50aWZpZXIsXG4gICAgICAgICAgICAnPT09JyxcbiAgICAgICAgICAgICdcXCdmdW5jdGlvblxcJycsXG4gICAgICAgICAgICAnPycsXG4gICAgICAgICAgICBpZGVudGlmaWVyICsgJygpJyxcbiAgICAgICAgICAgICc6JyxcbiAgICAgICAgICAgIGlkZW50aWZpZXIsXG4gICAgICAgICAgICAnKSdcbiAgICAgICAgXS5qb2luKCcgJyk7XG4gICAgdmFsdWUgPSBlbnRyeS5maWx0ZXJzLnJlZHVjZShmdW5jdGlvbiAobWVtbywgZmlsdGVyKSB7XG4gICAgICAgIHZhciBhcmdzID0gZmlsdGVyLmFyZ3MubGVuZ3RoID8gJywgJyArIGZpbHRlci5hcmdzLmpvaW4oJywgJykgOiAnJztcbiAgICAgICAgcmV0dXJuICdmaWx0ZXJzW1xcJycgKyBmaWx0ZXIudmFsdWUgKyAnXFwnXScgKyAnKCcgKyBtZW1vICsgYXJncyArICcpJztcbiAgICB9LCB2YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xufTtcbkNvbXBpbGVyLnByb3RvdHlwZS5jb21waWxlQ29uZGl0aW9uYWwgPSBmdW5jdGlvbiAoZW50cnkpIHtcbiAgICBpZiAoZW50cnkuY29uZGl0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGNvbmRpdGlvbnMgdG8gaWYgc3RhdGVtZW50LicpO1xuICAgIH1cbiAgICB2YXIgY29uZGl0aW9uID0gZW50cnkuY29uZGl0aW9ucy5tYXAoZnVuY3Rpb24gKGNvbmRpdGlvbikge1xuICAgICAgICAgICAgc3dpdGNoIChjb25kaXRpb24udHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnSWRlbnRpZmllcic6IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZUlkZW50aWZpZXIoY29uZGl0aW9uLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdOb3QnOiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnISc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnTGl0ZXJhbCc6IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmRpdGlvbi52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdFcXVhbGl0eSc6IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbmRpdGlvbi52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmpvaW4oJyAnKTtcbiAgICB2YXIgZWxzID0gZW50cnkuZWxzID8gdGhpcy5wcm9jZXNzKGVudHJ5LmVscy5ib2R5KSA6IG51bGw7XG4gICAgdmFyIGVsc2lmID0gZW50cnkuZWxzaWYgPyB0aGlzLmNvbXBpbGVDb25kaXRpb25hbChlbnRyeS5lbHNpZikgOiBudWxsO1xuICAgIHJldHVybiBbXG4gICAgICAgICcoJyxcbiAgICAgICAgJygnLFxuICAgICAgICBjb25kaXRpb24sXG4gICAgICAgICcpJyxcbiAgICAgICAgJz8nLFxuICAgICAgICB0aGlzLnByb2Nlc3MoZW50cnkuYm9keSksXG4gICAgICAgICc6JyxcbiAgICAgICAgZWxzIHx8IGVsc2lmIHx8ICdcXCdcXCcnLFxuICAgICAgICAnKSdcbiAgICBdLmpvaW4oJycpO1xufTtcbkNvbXBpbGVyLnByb3RvdHlwZS5jb21waWxlTG9vcCA9IGZ1bmN0aW9uIChlbnRyeSkge1xuICAgIHZhciBrZXlWYWwgPSBbXG4gICAgICAgICAgICBlbnRyeS5jb25kaXRpb25zWzNdID8gZW50cnkuY29uZGl0aW9uc1szXS52YWx1ZSA6ICdpJyxcbiAgICAgICAgICAgIGVudHJ5LmNvbmRpdGlvbnNbMl0gPyBlbnRyeS5jb25kaXRpb25zWzJdLnZhbHVlIDogJy4nXG4gICAgICAgIF07XG4gICAgdmFyIGxvb3AgPSBbXG4gICAgICAgICAgICAnbWFwKCcsXG4gICAgICAgICAgICBub3JtYWxpemVJZGVudGlmaWVyKGVudHJ5LmNvbmRpdGlvbnNbMF0udmFsdWUpLFxuICAgICAgICAgICAgJywnLFxuICAgICAgICAgICAgJ1xcJycsXG4gICAgICAgICAgICBrZXlWYWxbMF0sXG4gICAgICAgICAgICAnXFwnJyxcbiAgICAgICAgICAgICcsJyxcbiAgICAgICAgICAgICdcXCcnLFxuICAgICAgICAgICAga2V5VmFsWzFdLFxuICAgICAgICAgICAgJ1xcJycsXG4gICAgICAgICAgICAnLCcsXG4gICAgICAgICAgICAnZGF0YScsXG4gICAgICAgICAgICAnLCcsXG4gICAgICAgICAgICAnZnVuY3Rpb24oZGF0YSkgeycsXG4gICAgICAgICAgICAncmV0dXJuICcgKyB0aGlzLnByb2Nlc3MoZW50cnkuYm9keSwga2V5VmFsKSxcbiAgICAgICAgICAgICd9JyxcbiAgICAgICAgICAgICcpLmpvaW4oXFwnXFwnKSdcbiAgICAgICAgXS5qb2luKCcnKTtcbiAgICByZXR1cm4gbG9vcDtcbn07XG5Db21waWxlci5wcm90b3R5cGUuY29tcGlsZVBhcnRpYWwgPSBmdW5jdGlvbiAoZW50cnkpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAnKCcsXG4gICAgICAgICdwYXJ0aWFsc1tcXCcnICsgZW50cnkudmFsdWUgKyAnXFwnXS5yZW5kZXIoJyxcbiAgICAgICAgZW50cnkuYXJncy5sZW5ndGggPyBub3JtYWxpemVJZGVudGlmaWVyKGVudHJ5LmFyZ3NbMF0pIDogJ251bGwnLFxuICAgICAgICAnKScsXG4gICAgICAgICcpJ1xuICAgIF0uam9pbignJyk7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBDb21waWxlcjsiLCIndXNlIHN0cmljdCc7XG52YXIgZXNjYXBlRGVsaW1pdGVyID0gcmVxdWlyZSgnLi91dGlscy9lc2NhcGVfZGVsaW1pdGVyJyk7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4vdXRpbHMvb2JqZWN0X2tleXMnKTtcbmZ1bmN0aW9uIEdyYW1tYXIoZGVsaW1pdGVycykge1xuICAgIHRoaXMuZGVsaW1pdGVycyA9IGRlbGltaXRlcnM7XG4gICAgdGhpcy5pbnRlcm5hbCA9IFtcbiAgICAgICAgbWFrZUVudHJ5KCdTVEFSVF9JRicsICdpZicpLFxuICAgICAgICBtYWtlRW50cnkoJ0VMU0UnLCAnZWxzZScpLFxuICAgICAgICBtYWtlRW50cnkoJ0VMU0lGJywgJ2Vsc2lmJyksXG4gICAgICAgIG1ha2VFbnRyeSgnRU5EX0lGJywgJ2VuZGlmJyksXG4gICAgICAgIG1ha2VFbnRyeSgnTk9UJywgJ25vdCcpLFxuICAgICAgICBtYWtlRW50cnkoJ0VRVUFMSVRZJywgJz09JyksXG4gICAgICAgIG1ha2VFbnRyeSgnTk9UX0VRVUFMSVRZJywgJyE9JyksXG4gICAgICAgIG1ha2VFbnRyeSgnR1JFQVRFUl9USEFOX0VRVUFMJywgJz49JyksXG4gICAgICAgIG1ha2VFbnRyeSgnR1JFQVRFUl9USEFOJywgJz4nKSxcbiAgICAgICAgbWFrZUVudHJ5KCdMRVNTX1RIQU5fRVFVQUwnLCAnPD0nKSxcbiAgICAgICAgbWFrZUVudHJ5KCdMRVNTX1RIQU4nLCAnPCcpLFxuICAgICAgICBtYWtlRW50cnkoJ05PVCcsICdub3QnKSxcbiAgICAgICAgbWFrZUVudHJ5KCdTVEFSVF9FQUNIJywgJ2VhY2gnKSxcbiAgICAgICAgbWFrZUVudHJ5KCdFTkRfRUFDSCcsICdlbmRlYWNoJyksXG4gICAgICAgIG1ha2VFbnRyeSgnQVNTSUdOJywgJ2FzJyksXG4gICAgICAgIG1ha2VFbnRyeSgnUEFSVElBTCcsICdwYXJ0aWFsJyksXG4gICAgICAgIG1ha2VFbnRyeSgnTUFHSUMnLCAnLicpXG4gICAgXTtcbn1cbmZ1bmN0aW9uIG1ha2VFbnRyeShuYW1lLCB2YWx1ZSkge1xuICAgIHZhciBlc2NhcGVkID0gZXNjYXBlRGVsaW1pdGVyKHZhbHVlKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBlc2NhcGVkOiBlc2NhcGVkLFxuICAgICAgICB0ZXN0OiBuZXcgUmVnRXhwKCdeJyArIGVzY2FwZWQpXG4gICAgfTtcbn1cbkdyYW1tYXIucHJvdG90eXBlLmVzY2FwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIga2V5cyA9IG9iamVjdEtleXModGhpcy5kZWxpbWl0ZXJzKTtcbiAgICB2YXIgZ3JhbW1hciA9IFtdO1xuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGdyYW1tYXIucHVzaChtYWtlRW50cnkoa2V5LCB0aGlzLmRlbGltaXRlcnNba2V5XSkpO1xuICAgIH0sIHRoaXMpO1xuICAgIGdyYW1tYXIucHVzaC5hcHBseShncmFtbWFyLCB0aGlzLmludGVybmFsKTtcbiAgICB2YXIgc3RyaW5nID0gZ3JhbW1hci5tYXAoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuZXNjYXBlZDtcbiAgICAgICAgfSkuam9pbignfCcpO1xuICAgIGdyYW1tYXIucHVzaCh7XG4gICAgICAgIG5hbWU6ICdXSElURVNQQUNFJyxcbiAgICAgICAgdGVzdDogL15bXFwgfFxcdHxcXHJ8XFxuXSsvXG4gICAgfSk7XG4gICAgc3RyaW5nICs9ICd8IHxcXHR8XFxyfFxcbic7XG4gICAgZ3JhbW1hci5wdXNoKHtcbiAgICAgICAgbmFtZTogJ09USEVSJyxcbiAgICAgICAgdGVzdDogbmV3IFJlZ0V4cCgnXigoPyEnICsgc3RyaW5nICsgJykuKSonKVxuICAgIH0pO1xuICAgIHJldHVybiBncmFtbWFyO1xufTtcbm1vZHVsZS5leHBvcnRzID0gR3JhbW1hcjsiLCIndXNlIHN0cmljdCc7XG52YXIgR3JhbW1hciA9IHJlcXVpcmUoJy4vZ3JhbW1hcicpO1xudmFyIFRva2VuaXplciA9IHJlcXVpcmUoJy4vdG9rZW5pemVyJyk7XG52YXIgVHJlZSA9IHJlcXVpcmUoJy4vdHJlZScpO1xudmFyIENvbXBpbGVyID0gcmVxdWlyZSgnLi9jb21waWxlcicpO1xudmFyIHJlZ2lzdGVyUGFydGlhbCA9IHJlcXVpcmUoJy4vc2hhcmVkL3JlZ2lzdGVyX3BhcnRpYWwnKTtcbnZhciByZWdpc3RlckZpbHRlciA9IHJlcXVpcmUoJy4vc2hhcmVkL3JlZ2lzdGVyX2ZpbHRlcicpO1xudmFyIHR5cGUgPSByZXF1aXJlKCcuL3V0aWxzL3R5cGUnKTtcbmZ1bmN0aW9uIENvbWJ5bmUodGVtcGxhdGUsIGRhdGEpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ29tYnluZSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb21ieW5lKHRlbXBsYXRlLCBkYXRhKTtcbiAgICB9XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgIHRoaXMuZGF0YSA9IGRhdGEgfHwge307XG4gICAgdGhpcy5fcGFydGlhbHMgPSB7fTtcbiAgICB0aGlzLl9maWx0ZXJzID0ge307XG4gICAgaWYgKHR5cGUodGhpcy50ZW1wbGF0ZSkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVGVtcGxhdGUgbXVzdCBiZSBhIFN0cmluZy4nKTtcbiAgICB9XG4gICAgdGhpcy5fcmVmcmVzaChDb21ieW5lLnNldHRpbmdzLmRlbGltaXRlcnMpO1xufVxuQ29tYnluZS5wcm90b3R5cGUuX3JlZnJlc2ggPSBmdW5jdGlvbiAoZGVsaW1pdGVycykge1xuICAgIHZhciBncmFtbWFyID0gbmV3IEdyYW1tYXIoZGVsaW1pdGVycykuZXNjYXBlKCk7XG4gICAgdmFyIHN0YWNrID0gbmV3IFRva2VuaXplcih0aGlzLnRlbXBsYXRlLCBncmFtbWFyKS5wYXJzZSgpO1xuICAgIHZhciB0cmVlID0gbmV3IFRyZWUoc3RhY2spLm1ha2UoKTtcbiAgICB0aGlzLnRyZWUgPSB0cmVlO1xuICAgIHRoaXMuc3RhY2sgPSBzdGFjaztcbiAgICB0aGlzLmNvbXBpbGVyID0gbmV3IENvbXBpbGVyKHRyZWUpO1xuICAgIHRoaXMuc291cmNlID0gdGhpcy5jb21waWxlci5zb3VyY2U7XG59O1xuQ29tYnluZS5wcm90b3R5cGUuc2V0RGVsaW1pdGVycyA9IGZ1bmN0aW9uIChsb2NhbCkge1xuICAgIHZhciBkZWxpbWl0ZXJzID0ge307XG4gICAgZnVuY3Rpb24gaW5oZXJpdHMobmFtZSkge1xuICAgICAgICByZXR1cm4gbG9jYWxbbmFtZV0gfHwgQ29tYnluZS5zZXR0aW5ncy5kZWxpbWl0ZXJzW25hbWVdO1xuICAgIH1cbiAgICBkZWxpbWl0ZXJzID0ge1xuICAgICAgICBTVEFSVF9QUk9QOiBpbmhlcml0cygnU1RBUlRfUFJPUCcpLFxuICAgICAgICBFTkRfUFJPUDogaW5oZXJpdHMoJ0VORF9QUk9QJyksXG4gICAgICAgIFNUQVJUX0VYUFI6IGluaGVyaXRzKCdTVEFSVF9FWFBSJyksXG4gICAgICAgIEVORF9FWFBSOiBpbmhlcml0cygnRU5EX0VYUFInKSxcbiAgICAgICAgQ09NTUVOVDogaW5oZXJpdHMoJ0NPTU1FTlQnKSxcbiAgICAgICAgRklMVEVSOiBpbmhlcml0cygnRklMVEVSJylcbiAgICB9O1xuICAgIHRoaXMuX3JlZnJlc2goZGVsaW1pdGVycyk7XG59O1xuQ29tYnluZS5wcm90b3R5cGUucmVnaXN0ZXJQYXJ0aWFsID0gcmVnaXN0ZXJQYXJ0aWFsO1xuQ29tYnluZS5wcm90b3R5cGUucmVnaXN0ZXJGaWx0ZXIgPSByZWdpc3RlckZpbHRlcjtcbkNvbWJ5bmUuc2V0dGluZ3MgPSB7XG4gICAgZGVsaW1pdGVyczoge1xuICAgICAgICBTVEFSVF9QUk9QOiAne3snLFxuICAgICAgICBFTkRfUFJPUDogJ319JyxcbiAgICAgICAgU1RBUlRfRVhQUjogJ3slJyxcbiAgICAgICAgRU5EX0VYUFI6ICclfScsXG4gICAgICAgIENPTU1FTlQ6ICctLScsXG4gICAgICAgIEZJTFRFUjogJ3wnXG4gICAgfVxufTtcbkNvbWJ5bmUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdGhpcy5kYXRhID0gZGF0YSB8fCB0aGlzLmRhdGE7XG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZXIuZnVuYyh0aGlzLmRhdGEsIHRoaXMuX3BhcnRpYWxzLCB0aGlzLl9maWx0ZXJzKTtcbn07XG5Db21ieW5lLlZFUlNJT04gPSAnMC4zLjEnO1xubW9kdWxlLmV4cG9ydHMgPSBDb21ieW5lOyIsIid1c2Ugc3RyaWN0JztcbnZhciByZWdpc3RlckZpbHRlciA9IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX2ZpbHRlcnNbbmFtZV0gPSBjYWxsYmFjaztcbn07XG5tb2R1bGUuZXhwb3J0cyA9IHJlZ2lzdGVyRmlsdGVyOyIsIid1c2Ugc3RyaWN0JztcbnZhciByZWdpc3RlclBhcnRpYWwgPSBmdW5jdGlvbiAobmFtZSwgdGVtcGxhdGUpIHtcbiAgICB0aGlzLl9wYXJ0aWFsc1tuYW1lXSA9IHRlbXBsYXRlO1xuICAgIHRoaXMuX3BhcnRpYWxzW25hbWVdLl9maWx0ZXJzID0gdGhpcy5fZmlsdGVycztcbn07XG5tb2R1bGUuZXhwb3J0cyA9IHJlZ2lzdGVyUGFydGlhbDsiLCIndXNlIHN0cmljdCc7XG5mdW5jdGlvbiBUb2tlbml6ZXIodGVtcGxhdGUsIGdyYW1tYXIpIHtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgdGhpcy5ncmFtbWFyID0gZ3JhbW1hcjtcbiAgICB0aGlzLnN0YWNrID0gW107XG59XG5mdW5jdGlvbiBwYXJzZU5leHRUb2tlbih0ZW1wbGF0ZSwgZ3JhbW1hciwgc3RhY2spIHtcbiAgICBncmFtbWFyLnNvbWUoZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgICAgIHZhciBjYXB0dXJlID0gdG9rZW4udGVzdC5leGVjKHRlbXBsYXRlKTtcbiAgICAgICAgaWYgKGNhcHR1cmUgJiYgY2FwdHVyZVswXSkge1xuICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKHRva2VuLnRlc3QsICcnKTtcbiAgICAgICAgICAgIHN0YWNrLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IHRva2VuLm5hbWUsXG4gICAgICAgICAgICAgICAgY2FwdHVyZTogY2FwdHVyZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0ZW1wbGF0ZTtcbn1cblRva2VuaXplci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZTtcbiAgICB2YXIgZ3JhbW1hciA9IHRoaXMuZ3JhbW1hcjtcbiAgICB2YXIgc3RhY2sgPSB0aGlzLnN0YWNrO1xuICAgIHZhciBzdGFja0xlbiA9IDA7XG4gICAgd2hpbGUgKHRlbXBsYXRlLmxlbmd0aCkge1xuICAgICAgICB0ZW1wbGF0ZSA9IHBhcnNlTmV4dFRva2VuKHRlbXBsYXRlLCBncmFtbWFyLCBzdGFjayk7XG4gICAgICAgIHN0YWNrTGVuID0gc3RhY2subGVuZ3RoO1xuICAgICAgICBpZiAoc3RhY2tMZW4gLSAyID49IDApIHtcbiAgICAgICAgICAgIHN0YWNrW3N0YWNrTGVuIC0gMV0ucHJldmlvdXMgPSBzdGFja1tzdGFja0xlbiAtIDJdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdGFjaztcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFRva2VuaXplcjsiLCIndXNlIHN0cmljdCc7XG52YXIgaXNTdHJpbmcgPSAvWydcIl0rLztcbmZ1bmN0aW9uIFRyZWUoc3RhY2spIHtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2suc2xpY2UoKTtcbiAgICB0aGlzLnJvb3QgPSB7XG4gICAgICAgIHR5cGU6ICdUZW1wbGF0ZScsXG4gICAgICAgIGJvZHk6IFtdXG4gICAgfTtcbn1cblRyZWUucHJvdG90eXBlLmNvbnN0cnVjdFByb3BlcnR5ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBwcm9wZXJ0eURlc2NyaXB0b3IgPSB7XG4gICAgICAgICAgICB0eXBlOiAnUHJvcGVydHknLFxuICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgZmlsdGVyczogW11cbiAgICAgICAgfTtcbiAgICB3aGlsZSAodGhpcy5zdGFjay5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy5zdGFjay5zaGlmdCgpO1xuICAgICAgICBzd2l0Y2ggKGVudHJ5Lm5hbWUpIHtcbiAgICAgICAgY2FzZSAnV0hJVEVTUEFDRSc6IHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnRklMVEVSJzoge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdEZpbHRlcihwcm9wZXJ0eURlc2NyaXB0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdFTkRfUFJPUCc6IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcGVydHlEZXNjcmlwdG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHlEZXNjcmlwdG9yLnZhbHVlICs9IGVudHJ5LmNhcHR1cmVbMF0udHJpbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignVW50ZXJtaW5hdGVkIHByb3BlcnR5LicpO1xufTtcblRyZWUucHJvdG90eXBlLmNvbnN0cnVjdFBhcnRpYWwgPSBmdW5jdGlvbiAocm9vdCkge1xuICAgIHJvb3QudHlwZSA9ICdQYXJ0aWFsRXhwcmVzc2lvbic7XG4gICAgZGVsZXRlIHJvb3QuYm9keTtcbiAgICByb290LmFyZ3MgPSBbXTtcbiAgICBMT09QOlxuICAgICAgICB3aGlsZSAodGhpcy5zdGFjay5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBlbnRyeSA9IHRoaXMuc3RhY2suc2hpZnQoKTtcbiAgICAgICAgICAgIHN3aXRjaCAoZW50cnkubmFtZSkge1xuICAgICAgICAgICAgY2FzZSAnT1RIRVInOiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyb290LnZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3QudmFsdWUgPSBlbnRyeS5jYXB0dXJlWzBdLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3QuYXJncy5wdXNoKGVudHJ5LmNhcHR1cmVbMF0udHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdXSElURVNQQUNFJzoge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdFTkRfRVhQUic6IHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgTE9PUDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCAnICsgZW50cnkubmFtZSArICcgZW5jb3VudGVyZWQuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgcmV0dXJuIHJvb3Q7XG59O1xuVHJlZS5wcm90b3R5cGUuY29uc3RydWN0RmlsdGVyID0gZnVuY3Rpb24gKHJvb3QpIHtcbiAgICB2YXIgY3VycmVudCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdGaWx0ZXInLFxuICAgICAgICAgICAgYXJnczogW11cbiAgICAgICAgfTtcbiAgICB2YXIgcHJldmlvdXMgPSB7fTtcbiAgICBMT09QOlxuICAgICAgICB3aGlsZSAodGhpcy5zdGFjay5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBlbnRyeSA9IHRoaXMuc3RhY2suc2hpZnQoKTtcbiAgICAgICAgICAgIHN3aXRjaCAoZW50cnkubmFtZSkge1xuICAgICAgICAgICAgY2FzZSAnT1RIRVInOiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50LnZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQudmFsdWUgPSBlbnRyeS5jYXB0dXJlWzBdLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuYXJncy5wdXNoKGVudHJ5LmNhcHR1cmVbMF0udHJpbSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdXSElURVNQQUNFJzoge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdFTkRfUFJPUCc6IHtcbiAgICAgICAgICAgICAgICAgICAgcm9vdC5maWx0ZXJzLnB1c2goY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIExPT1A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnRklMVEVSJzoge1xuICAgICAgICAgICAgICAgICAgICByb290LmZpbHRlcnMucHVzaChjdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3RGaWx0ZXIocm9vdCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkICcgKyBlbnRyeS5uYW1lICsgJyBlbmNvdW50ZXJlZC4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmV2aW91cyA9IGVudHJ5O1xuICAgICAgICB9XG4gICAgcmV0dXJuIHJvb3Q7XG59O1xuVHJlZS5wcm90b3R5cGUuY29uc3RydWN0RWFjaCA9IGZ1bmN0aW9uIChyb290KSB7XG4gICAgcm9vdC50eXBlID0gJ0xvb3BFeHByZXNzaW9uJztcbiAgICByb290LmNvbmRpdGlvbnMgPSBbXTtcbiAgICBMT09QOlxuICAgICAgICB3aGlsZSAodGhpcy5zdGFjay5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBlbnRyeSA9IHRoaXMuc3RhY2suc2hpZnQoKTtcbiAgICAgICAgICAgIHN3aXRjaCAoZW50cnkubmFtZSkge1xuICAgICAgICAgICAgY2FzZSAnT1RIRVInOiB7XG4gICAgICAgICAgICAgICAgICAgIHJvb3QuY29uZGl0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdJZGVudGlmaWVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBlbnRyeS5jYXB0dXJlWzBdLnRyaW0oKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnQVNTSUdOJzoge1xuICAgICAgICAgICAgICAgICAgICByb290LmNvbmRpdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnQXNzaWdubWVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZW50cnkuY2FwdHVyZVswXS50cmltKClcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ0VORF9FWFBSJzoge1xuICAgICAgICAgICAgICAgICAgICBicmVhayBMT09QO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIHRoaXMubWFrZShyb290LCAnRU5EX0VBQ0gnKTtcbiAgICByZXR1cm4gcm9vdDtcbn07XG5UcmVlLnByb3RvdHlwZS5jb25zdHJ1Y3RDb21tZW50ID0gZnVuY3Rpb24gKHJvb3QpIHtcbiAgICB2YXIgcHJldmlvdXMgPSB7fTtcbiAgICB3aGlsZSAodGhpcy5zdGFjay5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy5zdGFjay5zaGlmdCgpO1xuICAgICAgICBzd2l0Y2ggKGVudHJ5Lm5hbWUpIHtcbiAgICAgICAgY2FzZSAnQ09NTUVOVCc6IHtcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXMubmFtZSA9PT0gJ1NUQVJUX0VYUFInKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0Q29tbWVudChyb290KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdFTkRfRVhQUic6IHtcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXMubmFtZSA9PT0gJ0NPTU1FTlQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJldmlvdXMgPSBlbnRyeTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblRyZWUucHJvdG90eXBlLmNvbnN0cnVjdENvbmRpdGlvbmFsID0gZnVuY3Rpb24gKHJvb3QsIGtpbmQpIHtcbiAgICByb290LnR5cGUgPSByb290LnR5cGUgfHwgJ0NvbmRpdGlvbmFsRXhwcmVzc2lvbic7XG4gICAgcm9vdC5jb25kaXRpb25zID0gcm9vdC5jb25kaXRpb25zIHx8IFtdO1xuICAgIHZhciBwcmV2aW91cyA9IHt9O1xuICAgIGlmIChraW5kID09PSAnRUxTRScpIHtcbiAgICAgICAgcm9vdC5lbHMgPSB7IGJvZHk6IFtdIH07XG4gICAgICAgIHJldHVybiB0aGlzLm1ha2Uocm9vdC5lbHMsICdFTkRfSUYnKTtcbiAgICB9XG4gICAgaWYgKGtpbmQgPT09ICdFTFNJRicpIHtcbiAgICAgICAgcm9vdC5lbHNpZiA9IHsgYm9keTogW10gfTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0Q29uZGl0aW9uYWwocm9vdC5lbHNpZik7XG4gICAgfVxuICAgIExPT1A6XG4gICAgICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy5zdGFjay5zaGlmdCgpO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gZW50cnkuY2FwdHVyZVswXS50cmltKCk7XG4gICAgICAgICAgICBzd2l0Y2ggKGVudHJ5Lm5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgJ05PVCc6IHtcbiAgICAgICAgICAgICAgICAgICAgcm9vdC5jb25kaXRpb25zLnB1c2goeyB0eXBlOiAnTm90JyB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnRVFVQUxJVFknOlxuICAgICAgICAgICAgY2FzZSAnTk9UX0VRVUFMSVRZJzpcbiAgICAgICAgICAgIGNhc2UgJ0dSRUFURVJfVEhBTic6XG4gICAgICAgICAgICBjYXNlICdHUkVBVEVSX1RIQU5fRVFVQUwnOlxuICAgICAgICAgICAgY2FzZSAnTEVTU19USEFOJzpcbiAgICAgICAgICAgIGNhc2UgJ0xFU1NfVEhBTl9FUVVBTCc6IHtcbiAgICAgICAgICAgICAgICAgICAgcm9vdC5jb25kaXRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0VxdWFsaXR5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBlbnRyeS5jYXB0dXJlWzBdLnRyaW0oKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnRU5EX0VYUFInOiB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIExPT1A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnV0hJVEVTUEFDRSc6IHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09ICdmYWxzZScgfHwgdmFsdWUgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdC5jb25kaXRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdMaXRlcmFsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoTnVtYmVyKHZhbHVlKSA9PT0gTnVtYmVyKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdC5jb25kaXRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdMaXRlcmFsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb290LmNvbmRpdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0xpdGVyYWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcmV2aW91cy50eXBlID09PSAnSWRlbnRpZmllcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzLnZhbHVlICs9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb290LmNvbmRpdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0lkZW50aWZpZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByZXZpb3VzID0gcm9vdC5jb25kaXRpb25zW3Jvb3QuY29uZGl0aW9ucy5sZW5ndGggLSAxXSB8fCB7fTtcbiAgICAgICAgfVxuICAgIHRoaXMubWFrZShyb290LCAnRU5EX0lGJyk7XG4gICAgcmV0dXJuIHJvb3Q7XG59O1xuVHJlZS5wcm90b3R5cGUuY29uc3RydWN0RXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChyb290LCBFTkQpIHtcbiAgICB2YXIgZXhwcmVzc2lvblJvb3QgPSB7IGJvZHk6IFtdIH07XG4gICAgd2hpbGUgKHRoaXMuc3RhY2subGVuZ3RoKSB7XG4gICAgICAgIHZhciB0eXBlID0gdGhpcy5zdGFjay5zaGlmdCgpO1xuICAgICAgICBzd2l0Y2ggKHR5cGUubmFtZSkge1xuICAgICAgICBjYXNlIEVORDoge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnV0hJVEVTUEFDRSc6IHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnQ09NTUVOVCc6IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RDb21tZW50KGV4cHJlc3Npb25Sb290KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnU1RBUlRfRUFDSCc6IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RFYWNoKGV4cHJlc3Npb25Sb290KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnRUxTSUYnOlxuICAgICAgICBjYXNlICdFTFNFJzpcbiAgICAgICAgY2FzZSAnU1RBUlRfSUYnOiB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUubmFtZSAhPT0gJ1NUQVJUX0lGJykge1xuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uUm9vdCA9IHJvb3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdENvbmRpdGlvbmFsKGV4cHJlc3Npb25Sb290LCB0eXBlLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlICdQQVJUSUFMJzoge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdFBhcnRpYWwoZXhwcmVzc2lvblJvb3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGV4cHJlc3Npb24gdHlwZS4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5UcmVlLnByb3RvdHlwZS5tYWtlID0gZnVuY3Rpb24gKHJvb3QsIEVORCkge1xuICAgIHJvb3QgPSByb290IHx8IHRoaXMucm9vdDtcbiAgICB2YXIgcmVzdWx0O1xuICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnN0YWNrLnNoaWZ0KCk7XG4gICAgICAgIHZhciBwcmV2ID0gcm9vdC5ib2R5W3Jvb3QuYm9keS5sZW5ndGggLSAxXTtcbiAgICAgICAgc3dpdGNoIChlbnRyeS5uYW1lKSB7XG4gICAgICAgIGNhc2UgJ1NUQVJUX1BST1AnOiB7XG4gICAgICAgICAgICAgICAgcm9vdC5ib2R5LnB1c2godGhpcy5jb25zdHJ1Y3RQcm9wZXJ0eSgpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnU1RBUlRfRVhQUic6IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID0gdGhpcy5jb25zdHJ1Y3RFeHByZXNzaW9uKHJvb3QsIEVORCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcm9vdC5ib2R5LnB1c2gocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXN1bHQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ0VORF9FWFBSJzoge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgdmFyIHByZXZXaGl0ZXNwYWNlID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKHByZXYgJiYgcHJldi50eXBlID09PSAnVGV4dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcm9vdC5ib2R5LnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBwcmV2V2hpdGVzcGFjZSA9IHByZXYudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJvb3QuYm9keS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1RleHQnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcHJldldoaXRlc3BhY2UgKyBlbnRyeS5jYXB0dXJlWzBdXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJvb3Q7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBUcmVlOyIsIid1c2Ugc3RyaWN0JztcbmZ1bmN0aW9uIGNyZWF0ZU9iamVjdChwYXJlbnQpIHtcbiAgICBmdW5jdGlvbiBGKCkge1xuICAgIH1cbiAgICBGLnByb3RvdHlwZSA9IHBhcmVudDtcbiAgICByZXR1cm4gbmV3IEYoKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlT2JqZWN0OyIsIid1c2Ugc3RyaWN0JztcbnZhciBzcGVjaWFsQ2hhcnNFeHAgPSAvW1xcXiRcXFxcXFwvLiorPygpXFxbXFxde318XS9nO1xuZnVuY3Rpb24gZXNjYXBlRGVsaW1pdGVyKGRlbGltaXRlcikge1xuICAgIHJldHVybiBkZWxpbWl0ZXIucmVwbGFjZShzcGVjaWFsQ2hhcnNFeHAsICdcXFxcJCYnKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZXNjYXBlRGVsaW1pdGVyOyIsIid1c2Ugc3RyaWN0JztcbnZhciB0eXBlID0gcmVxdWlyZSgnLi90eXBlJyk7XG52YXIgY3JlYXRlT2JqZWN0ID0gcmVxdWlyZSgnLi9jcmVhdGVfb2JqZWN0Jyk7XG5mdW5jdGlvbiBtYXAob2JqLCBpbmRleCwgdmFsdWUsIGRhdGEsIGl0ZXJhdG9yKSB7XG4gICAgdmFyIGlzQXJyYXlMaWtlID0gdHlwZShvYmopID09PSAnYXJndW1lbnRzJyB8fCB0eXBlKG9iaikgPT09ICdub2RlbGlzdCc7XG4gICAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5KG9iaikgfHwgaXNBcnJheUxpa2U7XG4gICAgdmFyIG91dHB1dCA9IFtdO1xuICAgIHZhciBpO1xuICAgIHZhciBkYXRhT2JqZWN0O1xuICAgIGlmIChpc0FycmF5KSB7XG4gICAgICAgIG9iaiA9IFtdLnNsaWNlLmNhbGwob2JqKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG9iai5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZGF0YU9iamVjdCA9IGNyZWF0ZU9iamVjdChkYXRhKTtcbiAgICAgICAgICAgIGRhdGFPYmplY3RbaW5kZXhdID0gaTtcbiAgICAgICAgICAgIGRhdGFPYmplY3RbdmFsdWVdID0gb2JqW2ldO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goaXRlcmF0b3IoZGF0YU9iamVjdCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChpIGluIG9iaikge1xuICAgICAgICAgICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRhdGFPYmplY3QgPSBjcmVhdGVPYmplY3QoZGF0YSk7XG4gICAgICAgICAgICBkYXRhT2JqZWN0W2luZGV4XSA9IGk7XG4gICAgICAgICAgICBkYXRhT2JqZWN0W3ZhbHVlXSA9IG9ialtpXTtcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKGl0ZXJhdG9yKGRhdGFPYmplY3QpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gbWFwOyIsIid1c2Ugc3RyaWN0JztcbmZ1bmN0aW9uIG9iamVjdEtleXMob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmICghb2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn1cbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0S2V5czsiLCIndXNlIHN0cmljdCc7XG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuZnVuY3Rpb24gdHlwZSh2YWx1ZSkge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbHVlKS5zbGljZSg4LCAtMSkudG9Mb3dlckNhc2UoKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gdHlwZTsiXX0=
(3)
});
