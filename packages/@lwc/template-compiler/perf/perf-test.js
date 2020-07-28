const test = require('./parse-perf');

const iterations = process.env.ITERATIONS || 10;
test(iterations);
