// set the global env
global.env = process.env.NODE_ENV || 'development';
global.appRoot = __dirname;

// runtime
const regeneratorRuntime = require('regenerator-runtime');

// set global
global.regeneratorRuntime = regeneratorRuntime;

// extensions
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];

// run try/catch
try {
  // log launching
  console.log(`NFT ${global.env} application...`);

  // register
  // eslint-disable-next-line global-require
  const register = require('@babel/register');

  // run babel register
  register({
    babelrc : true,
    extensions,
  });

  // require file
  require('./src/index.ts');
} catch (e) {
  // log error
  console.log(e);

  // exit
  process.exit(1);
}
