const assert = require('assert');
const Parser = require('../src/parser');

function test(eva, code, expected) {
    const exp = Parser.parse(`(begin ${code})`);
    assert.strictEqual(eva.evalGlobal(exp), expected);
}

module.exports = { test };
