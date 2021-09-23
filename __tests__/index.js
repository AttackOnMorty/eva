const Eva = require('../src/Eva');
const Environment = require('../src/Environment');

const tests = [
    require('./self-eval-test'),
    require('./math-test'),
    require('./variables-test'),
    require('./block-test'),
];

const eva = new Eva(
    new Environment({
        null: null,

        true: true,
        false: false,

        VERSION: 0.1,
    })
);

tests.forEach((test) => test(eva));

console.log('All assertions passed!');
