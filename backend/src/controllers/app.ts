
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
import AppTag from '../models/appTag';
import AppModel from '../models/app';
import TokenModel from '../models/appToken';
import VersionModel from '../models/appVersion';
import AppInstallModel from '../models/appInstall';

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
    const existingVersion = actualApp.get('id') ? await VersionModel.findByAppVersion(actualApp.get('id'), pushVersion) : null;

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
    const newVersion = (!actualApp.get('version') || semver.gt(pushVersion, actualApp.get('version'))) ? pushVersion : actualApp.get('version');

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
    actualApp.set('banner', pkg.moon?.banner);
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
   * task get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/app/:id')
  async getAction(req, { data, params }, next) {
    // check id
    if (params.id === 'list') return this.listAction(req, { data, params }, next);
    if (params.id === 'installed') return this.installedAction(req, { data, params }, next);

    // get segment
    const app = await AppModel.findById(params.id);

    // return segment
    return {
      result  : app ? await app.toJSON({}) : null,
      success : !!app,
    };
  }

  /**
   * post get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/app/list')
  async listAction(req, { data, params }, next) {
    // force default apps
    const allApps = await AppModel.findByRef('verified:true', data.limit || 12, data.sort || 'createdAt', data.direction || 'desc');

    // return post
    return {
      result  : await Promise.all(allApps.map((app) => app.toJSON())),
      success : true,
    };
  }

  /**
   * post get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/app/installed')
  async installedAction(req, { data, params }, next) {
    // force default apps
    const allApps = await AppModel.findByDefault();

    // user apps
    if (req.account) {
      // find by user
      const userApps = await AppInstallModel.findByAccount(req.account);

      // push
      allApps.push(...userApps);
    }

    // return post
    return {
      result  : await Promise.all(allApps.map((app) => app.toJSON())),
      success : true,
    };
  }


  /**
   * post get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/tag/list')
  async tagListAction(req, { data, params }, next) {
    // force default apps
    const allTags = await AppTag.findByRef('published', data.limit || 10);

    // return post
    return {
      result  : await Promise.all(allTags.map((tag) => tag.toJSON())),
      success : true,
    };
  }

  /**
   * login route
   */
  @Route('GET', '/api/v1/install/:subject')
  async installGetAction(req, { data, params }, next) {
    // return json
    const { subject } = params;

    // check account
    if (!req.account) return {
      success : false,
      message : 'Authentication Required',
    };

    // lower account
    const lowerAccount = req.account?.toLowerCase();

    // is following
    const isInstalled = await AppModel.isInstalled(lowerAccount, subject);

    // return
    return {
      result  : isInstalled ? await isInstalled.toJSON() : false,
      success : true,
    }
  }

  /**
   * login route
   */
  @Route('POST', '/api/v1/install/:subject')
  async installAction(req, { data, params }, next) {
    // return json
    const { subject } = params;

    // check account
    if (!req.account) return {
      success : false,
      message : 'Authentication Required',
    };

    // load app
    const actualApp = await AppModel.findById(subject);

    // check app
    if (!actualApp) return {
      success : false,
      message : 'App not found',
    };

    // check app
    if (actualApp.get('default')) return {
      success : false,
      message : 'App already installed',
    };

    // lower account
    const lowerAccount = req.account?.toLowerCase();

    // is following
    const [newInstall, newCount] = await AppModel.addInstall(lowerAccount, subject);

    // return
    return {
      result : {
        count   : newCount,
        install : newInstall ? await newInstall.toJSON() : false,
      },
      success : true,
    }
  }

  /**
   * login route
   */
  @Route('POST', '/api/v1/consent/:subject')
  async consentAction(req, { data, params }, next) {
    // return json
    const { subject } = params;

    // check account
    if (!req.account) return {
      success : false,
      message : 'Authentication Required',
    };

    // load app
    const actualApp = await AppModel.findById(subject);

    // check app
    if (!actualApp) return {
      success : false,
      message : 'App not found',
    };

    // check app
    if (actualApp.get('default')) return {
      success : false,
      message : 'App already installed',
    };

    // lower account
    const lowerAccount = req.account?.toLowerCase();

    // is following
    const isInstalled = await AppModel.isInstalled(lowerAccount, subject);

    // check if is installed
    if (!isInstalled) return {
      success : false,
      message : 'App not installed',
    };

    // set concent
    isInstalled.set('consent', new Date());

    // return
    return {
      result  : await isInstalled.toJSON(),
      success : true,
    };
  }

  /**
   * login route
   */
  @Route('DELETE', '/api/v1/install/:subject')
  async uninstallAction(req, { data, params }, next) {
    // return json
    const { subject } = params;

    // check account
    if (!req.account) return {
      success : false,
      message : 'Authentication Required',
    };

    // load app
    const actualApp = await AppModel.findById(subject);

    // check app
    if (!actualApp) return {
      success : false,
      message : 'App not found',
    };

    // check app
    if (actualApp.get('default')) return {
      success : false,
      message : 'App already installed',
    };

    // lower account
    const lowerAccount = req.account?.toLowerCase();

    // is following
    const isInstalled = await AppModel.isInstalled(lowerAccount, subject);

    // new count
    let newCount = 0;

    // check following
    if (isInstalled) {
      // count
      const [, removeCount] = await isInstalled.remove();
      newCount = removeCount;
    }

    // return
    return {
      result : {
        count   : newCount,
        install : null,
      },
      success : true,
    }
  }
}