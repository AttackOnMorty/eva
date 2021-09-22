const assert = require('assert');

class Eva {
    eval(exp) {
        if (this.isNumber(exp)) {
            return exp;
        }

        if (this.isString(exp)) {
            return exp.slice(1, -1);
        }

        if (exp[0] === '+') {
            return this.eval(exp[1]) + this.eval(exp[2]);
        }

        throw 'Unimplemented';
    }

    isNumber(exp) {
        return typeof exp === 'number';
    }

    isString(exp) {
        return (
            typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"'
        );
    }
}

// ----------------------------------------
// Tests:

const eva = new Eva();

assert.strictEqual(eva.eval(1), 1);
assert.strictEqual(eva.eval('"hello"'), 'hello');

assert.strictEqual(eva.eval(['+', 1, 5]), 6);
assert.strictEqual(eva.eval(['+', ['+', 3, 2], 5]), 10);

console.log('All assertions passed!');
