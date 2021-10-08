const assert = require('assert');
const Parser = require('../src/parser');

function test(eva, code, expected) {
    const exp = Parser.parse(code);
    assert.strictEqual(eva.eval(exp), expected);
}

module.exports = { test };
