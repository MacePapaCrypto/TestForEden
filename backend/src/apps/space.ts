
// import app
import App, { Type } from '../base/app';

// models
import FeedModel from '../models/space';

/**
 * export default
 */
@Type('space')
class SpaceApp extends App {

  /**
   * menu
   */
  async menu() {
    // return menu
    return [
      {
        path : 'create',
        name : 'Create Space',
      },
      'divider',
      {
        path : 'hot',
        name : 'Hot Spaces',
      },
      {
        path : 'new',
        name : 'Latest Spaces',
      },
      {
        path : 'trending',
        name : 'Trending Spaces',
      },
      {
        path : 'following',
        name : 'Following Spaces',
      },
    ];
  }

  /**
   * sanitise
   */
  async toJSON(sanitised, path, cache = {}) {
    // check type
    const menu = await this.menu();
    
    // lists
    const menuItem = menu.find((l) => l.path === path);

    // if no list
    if (menuItem) {
      // return
      return {
        ...sanitised,

        name : menuItem.name,
        feed : menuItem.path,
      };
    }

    // return object
    return {
      ...sanitised,
    };
  }
}

// new feed app
export default new SpaceApp();