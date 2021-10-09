const { test } = require('./utils');

module.exports = (eva) => {
    test(
        eva,
        `
          (begin

            (var result 1)

            (-- result)

            result

          )
        `,
        0
    );
};
