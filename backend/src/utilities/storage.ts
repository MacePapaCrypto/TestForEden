
// import dependencies
import S3 from 'aws-sdk/clients/s3.js';
import config from '../config';

// export default
const R2 = new S3({
  endpoint        : `https://${config.get('r2.account')}.r2.cloudflarestorage.com`,
  accessKeyId     : `${config.get('r2.key')}`,
  secretAccessKey : `${config.get('r2.secret')}`,
});

// export default
export default R2;