const assert = require('assert');

// while <condition> <body>
module.exports = (eva) => {
    assert.strictEqual(
        eva.eval([
            'begin',

            ['var', 'counter', 0],

            [
                'while',
                ['<', 'counter', 10],
                ['set', 'counter', ['+', 'counter', 1]],
            ],

            'counter',
        ]),

        10
    );
};
