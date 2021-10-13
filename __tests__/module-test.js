const { test } = require('./utils');

module.exports = (eva) => {
    test(
        eva,
        `
          (import Math)

          ((prop Math abs) (- 10))
        `,
        10
    );

    test(
        eva,
        `
          (import Math)

          (var abs (prop Math abs))

          (abs (- 10))
        `,
        10
    );

    test(
        eva,
        `
          (import Math)

          (prop Math MAX_VALUE)
        `,
        1000
    );
};
