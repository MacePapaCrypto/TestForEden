
import copy from 'rollup-plugin-copy';
import babel from '@rollup/plugin-babel';
import assets from 'rollup-plugin-copy-assets';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

// rollup
const production = process.env.ENV === 'production';

// extensions
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// export default
export default {
  input  : 'src/index.ts',
  output : {
    file      : 'dist/index.min.js',
    format    : 'cjs',
    sourcemap : true,
  },
  plugins : [
    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      extensions,
      dedupe         : [],
      preferBuiltins : true,
    }),
    replace({
      'process.env.NODE_ENV' : JSON.stringify(production ? 'production' : 'development'),
    }),
    commonjs({
      include : [
        'node_modules/**',
      ],
      exclude : [
        'node_modules/process-es6/**',
      ],
    }),
    assets({
      assets : [
        'src/assets',
      ],
    }),
    babel({
      extensions,
      babelrc : true,
      include : ['*/**'],
      presets : [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
    }),
    copy({
      targets : [
        {
          src  : 'src/app.html',
          dest : 'dist',
        },
      ],
    }),

    production && terser(),
  ],
  watch : {
    clearScreen : false,
  },
  external : [
    'electron',
  ],
};
