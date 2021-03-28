import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import common from 'rollup-plugin-commonjs';
import { uglify } from "rollup-plugin-uglify";

export default {
    input: 'src/bootstrap.ts',
    context: {},
    output: [
        {
            file: pkg.main,
            format: 'umd',
        },
        {
            file: pkg.module,
            format: 'es',
        },
    ],
    watch: {
        skipWrite: false,
        clearScreen: false,
        include: 'src/**/*',
    },
    plugins: [
        common(),
        typescript({
            typescript: require('typescript'),
        }),
        uglify(),
    ],
}