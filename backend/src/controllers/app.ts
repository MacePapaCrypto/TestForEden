
// import local
import fs from 'fs-extra';
import R2 from '../utilities/storage';
import tar from 'tar';
import mime from 'mime-types';
import config from '../config';
import semver from 'semver';
import shortid from 'shortid';
import { StatusCodes } from 'http-status-codes';
import MoonController, { Route } from '../base/controller';

// apps
import apps from '../apps';
import AppModel from '../models/app';
import TokenModel from '../models/token';
import VersionModel from '../models/appVersion';

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

    // find token
    const token = await TokenModel.findByToken(authKey);
    const user  = token ? await token.getUser() : null;

    // check token
    if (!token || !user) {
      // status
      res.statusCode = StatusCodes.UNAUTHORIZED;

      // return jsx
      return {
        message : 'token not found',
        success : false,
      };
    }

    // create uuid
    const id = shortid();

    // name
    const packageName = decodeURIComponent(params.package);

    // find package
    const actualApp = await AppModel.findByPackage(packageName) || new AppModel({
      refs : [
        `package:${packageName}`.toLowerCase(),
        `verified:false`,
      ],

      account  : user.get('id'),
      package  : packageName,
      verified : false,
    });

    // check package
    if (actualApp.get('account') !== user.get('id')) {
      // status
      res.statusCode = StatusCodes.UNAUTHORIZED;

      // return jsx
      return {
        message : 'token not found',
        success : false,
      };
    }

    // get attachments
    const { _attachments, versions } = data;

    // log versions
    const [pushVersion] = Object.keys(versions);

    // find actual version
    const existingVersion = actualApp.get('id') && await VersionModel.findByAppVersion(actualApp.get('id'), pushVersion);

    // check package
    if (existingVersion) {
      // status
      res.statusCode = StatusCodes.CONFLICT;

      // return jsx
      return {
        message : 'version already exists',
        success : false,
      };
    }

    // set new version
    const newVersion = (actualApp.get('version') || semver.gt(pushVersion, actualApp.get('verison'))) ? pushVersion : actualApp.get('version');

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
        Key         : `app/${packageName}/${newVersion}/app.js`,
        Body        : fs.readFileSync(`/tmp/${id}/pkg/package/${main}`),
        Bucket      : config.get('r2.bucket'),
        ContentType : mimeType,
      }).promise();
    } catch (e) {
      console.log(e);
    }

    // update package
    actualApp.set('url',     `${packageName}/${newVersion}/app.js`);
    actualApp.set('version', newVersion);

    // set variables
    actualApp.set('tags', pkg.moon?.tags || pkg.keywords || []);
    actualApp.set('name', pkg.moon?.name || pkg.name);
    actualApp.set('icon', pkg.moon?.icon);
    actualApp.set('paths', pkg.moon?.paths || []);
    actualApp.set('space', pkg.moon?.space);
    actualApp.set('socials', pkg.moon?.socials || []);
    actualApp.set('website', pkg.moon?.website || pkg.homepage);
    actualApp.set('description', pkg.moon?.description || pkg.description);

    // save actual package
    await actualApp.save();

    // add version
    const actualVersion = new VersionModel({
      
      refs : [
        `${actualApp.get('id')}:${actualApp.get('version')}`,
      ],

      app     : actualApp.get('id'),
      package : packageName,
      version : actualApp.get('version'),
    });

    // save version
    await actualVersion.save();

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