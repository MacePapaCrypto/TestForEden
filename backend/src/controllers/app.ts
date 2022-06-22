
// import local
import fs from 'fs-extra';
import tar from 'tar';
import shortid from 'shortid';
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
  async publishAction(req, { files, data, params }, next) {
    // create uuid
    const id = shortid();

    // name
    const packageName = params.package;

    // get attachments
    const { _attachments, versions } = data;

    // save as file
    const fileBuffer = Buffer.from(Object.values(_attachments)[0].data, 'base64');

    // save file
    await fs.ensureDir(`${__dirname}/${id}/pkg`);
    await fs.writeFile(`${__dirname}/${id}/pkg.tgz`, fileBuffer);

    // unzip
    await tar.x({
      C    : `${__dirname}/${id}/pkg`,
      file : `${__dirname}/${id}/pkg.tgz`,
    });

    // return jsx
    return {
      
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