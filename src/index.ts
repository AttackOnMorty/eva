const assert = require('assert');

class Eva {
    eval(exp) {
        if (this.isNumber(exp)) {
            return exp;
        }

        throw 'Unimplemented';
    }

    isNumber(exp) {
        return typeof exp === 'number';
    }
}

// ----------------------------------------
// Tests:

const eva = new Eva();

assert.strictEqual(eva.eval(1), 1);

console.log('All assertions passed!');
