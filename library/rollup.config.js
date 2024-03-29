import pkg from './package.json';
import json from '@rollup/plugin-json';
import image from '@rollup/plugin-image';
import babel from '@rollup/plugin-babel';
import styles from 'rollup-plugin-styles';
import assets from 'rollup-plugin-copy-assets';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import builtIns from 'rollup-plugin-node-builtins';
import commonjs from '@rollup/plugin-commonjs';
import peerDeps from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';

// rollup
const production = !process.env.ROLLUP_WATCH;

// extensions
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// export default
export default {
  input  : 'src/index.ts',
  output : [
    {
      file      : pkg.main,
      format    : 'es',
      sourcemap : !production,
    },
  ],
  plugins : [
    builtIns(),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser : true,
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
    assets({
      assets : [
        'src/assets',
      ],
    }),
    replace({
      '\} catch \{' : `} catch(e) {`,
      delimiters : ['', '']
    }),
    image(),
    json(),
    babel({
      extensions,
      babelrc : true,
      include : ['src/**/*'],
      presets : [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
    }),
    styles({
      mode : 'inject',
    }),
    peerDeps(),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch : {
    clearScreen : false,
  },
};
