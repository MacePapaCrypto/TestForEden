
// register
const register = require('@babel/register');

// extensions
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// register
register({
  extensions,
  babelrc : true,
  include : ['*/**'],
  presets : [
    '@babel/preset-env',
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
});

// require index
require('./src/index.ts');