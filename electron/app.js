
// production app
const production = false && process.env.NODE_ENV === 'production';

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
      '@babel/preset-typescript',
      '@babel/preset-react',
    ],
  });

  // require index
  require('./src/app.tsx');
} else {
  require('./dist/app.min.js');
}