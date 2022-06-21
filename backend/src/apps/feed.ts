
// import app
import App, { Type } from '../base/app';

// models
import FeedModel from '../models/feed';

/**
 * export default
 */
@Type('feed')
class FeedApp extends App {

  /**
   * menu
   */
  async menu() {
    // return menu
    return [
      {
        path : 'hot',
        name : 'Hot',
      },
      {
        path : 'new',
        name : 'Latest',
      },
      {
        path : 'following',
        name : 'Following',
      },
    ];
  }

  /**
   * sanitise
   */
  async toJSON(sanitised, path, cache = {}, req) {
    // load feed
    let actualFeed = await FeedModel.findById(path);
    let actualName = null;

    // menu
    const actualMenu = await this.menu();
    const foundMenu = actualMenu.find((m) => m.path === path);

    // check path
    if (foundMenu) {
      // actual feed
      actualFeed = await FeedModel.findById('public');
      actualName = foundMenu.name;
    }

    // return object
    return {
      ...sanitised,

      feed : actualFeed.get('id'),
      name : actualName || actualFeed.get('name'),
    };
  }
}

// new feed app
export default new FeedApp();