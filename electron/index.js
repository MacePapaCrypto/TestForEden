
const production = process.env.NODE_ENV === 'production';

// production
if (!production) {
  // register
  const register = require('@babel/register');

  // extensions
  const extensions = ['.js', '.jsx', '.ts', '.tsx'];

  // register
  register({
    extensions,
    ignore : [(path) => {
      // check extension
      if (!path.includes('node_modules')) return false;

      // get extension
      const ext = path.split('.').pop();

      // don't ignore
      if (['ts', 'tsx'].includes(ext)) return false;

      // ignore
      return true;
    }],
    babelrc : true,
    include : ['*/**'],
    presets : [
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-typescript',
    ],
  });

  // require index
  require('./src/index.ts');
} else {
  require('./dist/index.min.js');
}