import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import common from 'rollup-plugin-commonjs';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
    input: 'src/bootstrap.ts',
    context: {},
    output: [
        {
            sourcemap: true,
            file: pkg.dev,
            format: 'umd',
        }
    ],
    watch: {
        skipWrite: false,
        clearScreen: false,
        include: 'src/**/*',
    },
    plugins: [
        common(),
        sourcemaps(),
        typescript({
            typescript: require('typescript'),
        }),
    ],
}