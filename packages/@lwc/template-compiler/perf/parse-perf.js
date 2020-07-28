/* eslint-disable no-console */

const { readFileSync } = require('fs');
const { performance } = require('perf_hooks');

const evalStart = performance.now();
const { compileToFunction } = require('../dist/commonjs');
const evalEnd = performance.now();

console.log(`Compiler loading and evaluation time ${Math.round(evalEnd - evalStart)}ms\n`);


const testConfigs = [
    { fixture: 'record-layout-20-fields' },
    { fixture: 'record-layout-60-fields' },
    { fixture: 'record-layout-300-fields' },
];

function getCompilerConfig({ fixture }) {
    return {
        name: fixture,
        source: readFileSync(
            __dirname + `/test-templates/${fixture}.html`,
            'utf-8'
        )
    };
}

async function warmup(iterations) {
    console.log('Warmup...');

    await invokeMultiCompilation(
        iterations / 2,
        getCompilerConfig({
            fixture: 'record-layout-300-fields'
        }).source
    );
}

async function measure(iterations, compilerConfig) {
    const start = performance.now();

    await invokeMultiCompilation(iterations, compilerConfig.source);

    const end = performance.now();
    console.log(`${compilerConfig.name} - ${Math.round((end - start) / iterations)} ms`);
}

async function invokeMultiCompilation(iterations, source) {

    for (let count = 0; count < iterations; count++) {
        const res = await compileToFunction(source);

        // console.log(res.warnings.length);
        // console.log(res);
        if (!res) {
            throw new Error(`Compilation failed!!!`);
        }
    }
}

module.exports = async (iteration) => {
    await warmup(iteration);

    console.log(`Measuring average out of ${iteration}, component compilation time:`);

    for (const testConfig of testConfigs) {
        await measure(iteration, getCompilerConfig(testConfig));
    }
    // await measure(iteration, {
    //     name: 'large rrh template',
    //     source: readFileSync(
    //         __dirname + `/cmp.html`,
    //         // __dirname + `/tmp.html`,
    //         'utf-8'
    //     )
    // });
};
