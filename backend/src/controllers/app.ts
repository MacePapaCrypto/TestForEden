
// import local
import MoonController, { Route } from '../base/controller';

// apps
import apps from '../apps';

/**
 * create auth controller
 */
export default class AppController extends MoonController {

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