
import babel from '@rollup/plugin-babel';
import assets from 'rollup-plugin-copy-assets';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import builtIns from 'rollup-plugin-node-builtins';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

// rollup
const production = process.env.ENV === 'production';

// extensions
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// export default
export default {
  input  : 'src/index.tsx',
  output : {
    file      : 'dist/main.min.js',
    name      : 'app',
    format    : 'iife',
    sourcemap : true,
  },
  plugins : [
    builtIns(),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      dedupe  : [
        'react',
        'react-dom',
        'react-rnd',
        'react-router-dom',
        'react-material-ui-carousel',

        '@mui/lab',
        '@mui/system',
        '@mui/material',
        '@emotion/react',
        '@mui/icons-material',

        '@fortawesome/react-fontawesome',
        '@fortawesome/pro-solid-svg-icons',
        '@fortawesome/pro-regular-svg-icons',
      ],
      extensions,
    }),
    replace({
      'process.nextTick'     : 'setImmediate',
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
        '@babel/preset-typescript',
        '@babel/preset-react',
      ],
    }),

    production && terser(),
  ],
  watch : {
    clearScreen : false,
  },
};
