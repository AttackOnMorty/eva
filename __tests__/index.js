const Eva = require('../src/Eva');

const tests = [
    require('./self-eval-test'),
    require('./math-test'),
    require('./variables-test'),
    require('./block-test'),
    require('./if-test'),
    require('./while-test'),
    require('./built-in-function-test'),
    require('./user-defined-function-test'),
    require('./lambda-function-test'),
];

const eva = new Eva();

tests.forEach((test) => test(eva));

console.log('All assertions passed!');
