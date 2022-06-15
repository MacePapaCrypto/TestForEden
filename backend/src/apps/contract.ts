
// import app
import App, { Type } from '../base/app';

// models
import FeedModel from '../models/contract';

/**
 * export default
 */
@Type('contract')
class ContractApp extends App {

  /**
   * menu
   */
  async menu() {
    // return menu
    return [
      {
        path : 'hot',
        name : 'Hot Contracts',
      },
      {
        path : 'new',
        name : 'Latest Contracts',
      },
      {
        path : 'trending',
        name : 'Trending Contracts',
      },
      {
        path : 'following',
        name : 'Following Contracts',
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
export default new ContractApp();