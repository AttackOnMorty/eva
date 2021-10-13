/*
- TODO: Other data structures:

  (var base (object (value 100)))

  (object
    (x 10)
    (y 20)
    (__proto__ base))

  (var values (list 42 "Hello" foo))

  values[0]

  (idx values 0) // 42
  (idx values 1) // "Hello"
*/

const fs = require('fs');

const Environment = require('./Environment');
const Transformer = require('./Transformer');
const Parser = require('./parser');

class Eva {
    constructor(global = GlobalEnvironment) {
        this.global = global;
        this._transformer = new Transformer();
    }

    /**
     * Evaluates global code wrapping into a block.
     */

    evalGlobal(exp) {
        return this._evalBlock(exp, this.global);
    }

    eval(exp, env = this.global) {
        // --------------------------------------------
        // Self-evaluating expressions:

        if (this._isNumber(exp)) {
            return exp;
        }

        if (this._isString(exp)) {
            return exp.slice(1, -1);
        }

        // --------------------------------------------
        // Increment: (++ foo)
        //
        // Syntactic sugar for: (set foo (+ foo 1))

        if (exp[0] === '++') {
            const setExp = this._transformer.transformIncToSet(exp);
            return this.eval(setExp, env);
        }

        // --------------------------------------------
        // Decrement: (-- foo)
        //
        // Syntactic sugar for: (set foo (- foo 1))

        if (exp[0] === '--') {
            const setExp = this._transformer.transformDecToSet(exp);
            return this.eval(setExp, env);
        }

        // --------------------------------------------
        // Increment: (+= foo inc)
        //
        // Syntactic sugar for: (set foo (+ foo inc))

        if (exp[0] === '+=') {
            const setExp = this._transformer.transformIncValToSet(exp);
            return this.eval(setExp, env);
        }

        // --------------------------------------------
        // Decrement: (-= foo dec)
        //
        // Syntactic sugar for: (set foo (- foo dec))

        if (exp[0] === '-=') {
            const setExp = this._transformer.transformDecValToSet(exp);
            return this.eval(setExp, env);
        }

        // --------------------------------------------
        // Block: sequence of expressions

        if (exp[0] === 'begin') {
            const blockEnv = new Environment({}, env);
            return this._evalBlock(exp, blockEnv);
        }

        // --------------------------------------------
        // Variable declaration: (var foo 10)

        if (exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value, env));
        }

        // --------------------------------------------
        // Variable update: (set foo 10)

        if (exp[0] === 'set') {
            const [_, ref, value] = exp;

            if (ref[0] === 'prop') {
                const [_tag, instanceName, propName] = ref;
                const instanceEnv = this.eval(instanceName, env);
                return instanceEnv.define(propName, this.eval(value, env));
            }

            return env.assign(ref, this.eval(value, env));
        }

        // --------------------------------------------
        // if-expression: (if <condition> <consequent> <alternate>)

        if (exp[0] === 'if') {
            const [_tag, condition, consequent, alternate] = exp;
            if (this.eval(condition, env)) {
                return this.eval(consequent, env);
            }
            return this.eval(alternate, env);
        }

        // --------------------------------------------
        // switch-expression:

        if (exp[0] === 'switch') {
            const ifExp = this._transformer.transformSwitchToIf(exp);
            return this.eval(ifExp, env);
        }

        // --------------------------------------------
        // while-expression: (while <condition> <body>)

        if (exp[0] === 'while') {
            const [_tag, condition, body] = exp;
            let result;
            while (this.eval(condition, env)) {
                result = this.eval(body, env);
            }
            return result;
        }

        // --------------------------------------------
        // for-expression:

        if (exp[0] === 'for') {
            const whileExp = this._transformer.transformForToWhile(exp);
            return this.eval(whileExp, env);
        }

        // --------------------------------------------
        // Function declaration: (def square (x) (* x x))
        //
        // Syntactic sugar for: (var square (lambda (x) (* x x)))

        if (exp[0] === 'def') {
            // JIT-transpile to a variable declaration
            const varExp = this._transformer.transformDefToVarLambda(exp);
            return this.eval(varExp, env);
        }

        // --------------------------------------------
        // Lambda function: (lambda (x) (* x x))

        if (exp[0] === 'lambda') {
            const [_tag, params, body] = exp;

            return {
                params,
                body,
                env,
            };
        }

        // --------------------------------------------
        // Class declaration: (class <Name> <Parent> <Body>)

        if (exp[0] === 'class') {
            const [_tag, name, parent, body] = exp;
            const parentEnv = this.eval(parent, env) || env;
            const classEnv = new Environment({}, parentEnv);

            this._evalBody(body, classEnv);

            return env.define(name, classEnv);
        }

        // --------------------------------------------
        // Super expressions: (super <ClassName>)

        if (exp[0] === 'super') {
            const [_tag, className] = exp;
            return this.eval(className, env).parent;
        }

        // --------------------------------------------
        // Class instantiation: (new <Class> <Arguments>)

        if (exp[0] === 'new') {
            const classEnv = this.eval(exp[1], env);
            const instanceEnv = new Environment({}, classEnv);
            const args = exp.slice(2).map((arg) => this.eval(arg, env));

            this._callUserDefinedFunction(classEnv.lookup('constructor'), [
                instanceEnv,
                ...args,
            ]);

            return instanceEnv;
        }

        // --------------------------------------------
        // Property access: (prop <instanceName> <propName>)

        if (exp[0] === 'prop') {
            const [_tag, instanceName, propName] = exp;
            const instanceEnv = this.eval(instanceName, env);

            return instanceEnv.lookup(propName);
        }

        // --------------------------------------------
        // Module declaration: (module <name> <body>)

        if (exp[0] === 'module') {
            const [_tag, name, body] = exp;
            const moduleEnv = new Environment({}, env);

            this._evalBody(body, moduleEnv);

            return env.define(name, moduleEnv);
        }

        // --------------------------------------------
        // Module import: (import <name>)
        // (import (export1, export2, ...) <name>)
        // TODO: (import (abs, square) Math) / (exports (abs, square)) / (export (def square (x) (* x x)))

        if (exp[0] === 'import') {
            const [_tag, name] = exp;

            const moduleSrc = fs.readFileSync(
                `${__dirname}/modules/${name}.eva`
            );
            const body = Parser.parse(`(begin ${moduleSrc})`);
            const moduleExp = ['module', name, body];

            // NOTE: If we pass this.global as 2th argument, module will be stored in the global.
            return this.eval(moduleExp, env);
        }

        // --------------------------------------------
        // Function calls:
        //
        // (print "Hello World")
        // (+ x 5)
        // (> foo bar)

        if (Array.isArray(exp)) {
            const fn = this.eval(exp[0], env);
            const args = exp.slice(1).map((arg) => this.eval(arg, env));

            // 1. Native function:

            if (typeof fn === 'function') {
                return fn(...args);
            }

            // 2. User-defined function:

            return this._callUserDefinedFunction(fn, args);
        }

        // --------------------------------------------
        // Variable access: foo

        if (this._isVariableName(exp)) {
            return env.lookup(exp);
        }

        throw `Unimplemented: ${exp}`;
    }

    _callUserDefinedFunction(fn, args) {
        const activationRecord = {};

        fn.params.forEach((param, index) => {
            activationRecord[param] = args[index];
        });

        const activationEnv = new Environment(activationRecord, fn.env);

        return this._evalBody(fn.body, activationEnv);
    }

    _evalBody(body, env) {
        if (body[0] === 'begin') {
            return this._evalBlock(body, env);
        }
        return this.eval(body, env);
    }

    _evalBlock(block, blockEnv) {
        let result;
        const [_tag, ...expressions] = block;

        expressions.forEach((exp) => {
            result = this.eval(exp, blockEnv);
        });

        return result;
    }

    _isNumber(exp) {
        return typeof exp === 'number';
    }

    _isString(exp) {
        return (
            typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"'
        );
    }

    _isVariableName(exp) {
        return (
            typeof exp === 'string' &&
            (/^[a-zA-Z_$][0-9a-zA-Z_$]+/.test(exp) ||
                /^[+\-*/><=a-zA-Z0-9_]+$/.test(exp))
        );
    }
}

const GlobalEnvironment = new Environment({
    null: null,

    true: true,
    false: false,

    VERSION: 0.1,

    // Operators:

    '+': (op1, op2) => op1 + op2,

    '-': (op1, op2 = null) => {
        if (op2 === null) return -op1;
        return op1 - op2;
    },

    '*': (op1, op2) => op1 * op2,

    '/': (op1, op2) => op1 / op2,

    // Comparison:

    '>': (op1, op2) => op1 > op2,

    '<': (op1, op2) => op1 < op2,

    '>=': (op1, op2) => op1 >= op2,

    '<=': (op1, op2) => op1 <= op2,

    '===': (op1, op2) => op1 === op2,

    // Console output:

    print: (op1) => console.log(op1),
});

module.exports = Eva;
