
// import local
import fs from 'fs-extra';
import R2 from '../utilities/storage';
import tar from 'tar';
import mime from 'mime-types';
import config from '../config';
import shortid from 'shortid';
import { StatusCodes } from 'http-status-codes';
import MoonController, { Route } from '../base/controller';

// apps
import apps from '../apps';

/**
 * create auth controller
 */
export default class AppController extends MoonController {

  /**
   * publish package
   *
   * @param req 
   * @param param1 
   * @param next 
   */
  @Route('PUT', '/npm/:package/:_rev?/:revision?')
  async publishAction(req, res, next) {
    // const
    const { files, data, params } = res;

    // get auth key
    const authKey = (req.headers?.authorization || '').split(' ').pop();

    // create uuid
    const id = shortid();

    // name
    const packageName = params.package;

    // get attachments
    const { _attachments, versions } = data;

    // save as file
    const fileBuffer = Buffer.from(Object.values(_attachments)[0].data, 'base64');

    // save file
    await fs.ensureDir(`/tmp/${id}/pkg`);
    await fs.writeFile(`/tmp/${id}/pkg.tgz`, fileBuffer);

    // unzip
    await tar.x({
      C    : `/tmp/${id}/pkg`,
      file : `/tmp/${id}/pkg.tgz`,
    });

    // load package json
    const pkg = JSON.parse(fs.readFileSync(`/tmp/${id}/pkg/package/package.json`, 'utf-8'));

    // check main
    const main = pkg.main;

    // check type
    const mimeType = mime.lookup(main);

    // try/catch
    try {
      // upload file
      await R2.upload({
        Key         : `app/${decodeURIComponent(packageName)}/${pkg.version}/app.js`,
        Body        : fs.readFileSync(`/tmp/${id}/pkg/package/${main}`),
        Bucket      : config.get('r2.bucket'),
        ContentType : mimeType,
      }).promise();
    } catch (e) {
      console.log(e);
    }

    // status
    res.statusCode = StatusCodes.CREATED;

    // return jsx
    return {
      ok      : 'package published',
      success : true,
    };
  }


  /**
   * post get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/app/list')
  async getAction(req, { data, params }, next) {
    // accum
    const allApps = [];

    // apps
    await Promise.all(Object.values(apps).map(async (app) => {
      // Load namespace and subspace
      const type = Reflect.getMetadata('app:type', app.constructor);

      // return apps
      allApps.push({
        type,
        menu : await app.menu(req),
      });
    }));

    // return post
    return {
      result  : allApps,
      success : true,
    };
  }
}