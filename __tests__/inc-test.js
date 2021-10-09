const { test } = require('./utils');

module.exports = (eva) => {
    test(
        eva,
        `
          (begin

            (var result 0)

            (++ result)

            result

          )
        `,
        1
    );
};
