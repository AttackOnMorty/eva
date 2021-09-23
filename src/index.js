const assert = require('assert');
const Environment = require('./Environment');

class Eva {
    constructor(global = new Environment()) {
        this.global = global;
    }

    eval(exp, env = this.global) {
        //-----------------------------------------------
        // Self-evaluating expressions:

        if (this.isNumber(exp)) {
            return exp;
        }

        if (this.isString(exp)) {
            return exp.slice(1, -1);
        }

        //-----------------------------------------------
        // Math operations:

        if (exp[0] === '+') {
            return this.eval(exp[1]) + this.eval(exp[2]);
        }

        if (exp[0] === '*') {
            return this.eval(exp[1]) * this.eval(exp[2]);
        }

        //-----------------------------------------------
        // Variable declaration:

        if (exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value));
        }

        //-----------------------------------------------
        // Variable access:

        if (this.isVariableName(exp)) {
            return env.lookup(exp);
        }

        throw `Unimplemented: ${exp}`;
    }

    isNumber(exp) {
        return typeof exp === 'number';
    }

    isString(exp) {
        return (
            typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"'
        );
    }

    isVariableName(exp) {
        return typeof exp === 'string' && /^[a-zA-Z][0-9a-zA-Z_$]*/.test(exp);
    }
}

// ----------------------------------------
// Tests:

const eva = new Eva(
    new Environment({
        null: null,

        true: true,
        false: false,

        VERSION: 0.1,
    })
);

assert.strictEqual(eva.eval(1), 1);
assert.strictEqual(eva.eval('"hello"'), 'hello');

// Math:

assert.strictEqual(eva.eval(['+', 1, 5]), 6);
assert.strictEqual(eva.eval(['+', ['+', 3, 2], 5]), 10);

// Variables:

assert.strictEqual(eva.eval(['var', 'x', 10]), 10);
assert.strictEqual(eva.eval('x'), 10);

assert.strictEqual(eva.eval(['var', 'y', 100]), 100);
assert.strictEqual(eva.eval('y'), 100);

assert.strictEqual(eva.eval('VERSION'), 0.1);

assert.strictEqual(eva.eval(['var', 'isUser', 'true']), true);

assert.strictEqual(eva.eval(['var', 'z', ['*', 2, 2]]), 4);
assert.strictEqual(eva.eval('z'), 4);

console.log('All assertions passed!');
