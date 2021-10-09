const { test } = require('./utils');

module.exports = (eva) => {
    test(
        eva,
        `
          (begin

            (var result 5)

            (-= result 5)

            result

          )
        `,
        0
    );
};
