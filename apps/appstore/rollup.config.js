import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import styles from 'rollup-plugin-styles';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

// package
import pkg from './package.json';

// rollup
const production = !process.env.ROLLUP_WATCH;

// extensions
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// export default
export default {
  input  : 'src/index.tsx',
  output : [
    {
      file      : 'dist/index.js',
      name      : pkg.name,
      format    : 'umd',
      sourcemap : true,
      globals : {
        react : 'React',
        '@mui/lab' : 'MuiLab',
        'react-dom' : 'ReactDOM',
        '@moonup/ui' : 'MoonUi',
        '@mui/material' : 'Mui',

        // optional
        '@fortawesome/react-fontawesome'     : 'FontAwesome',
        '@fortawesome/pro-regular-svg-icons' : 'FontAwesomeRegular'
      },
    },
  ],
  external : [
    'react',
    '@mui/lab',
    'react-dom',
    '@moonup/ui',
    '@mui/material',

    // optional
    '@fortawesome/react-fontawesome',
    '@fortawesome/pro-regular-svg-icons'
  ],
  plugins : [

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser        : true,
      preferBuiltins : true,
      extensions,
    }),
    commonjs({
      include : [
        'node_modules/**',
      ],
      exclude : [
        'node_modules/process-es6/**',
      ],
    }),
    json(),
    babel({
      extensions,
      presets : [
        '@babel/preset-env',
        '@babel/preset-react',
      ],
    }),
    styles({
      mode : 'inject',
    }),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch : {
    clearScreen : false,
  },
};
