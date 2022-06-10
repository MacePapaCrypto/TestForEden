
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
   * sanitise
   */
  async toJSON(sanitised, path, cache = {}) {
    // load feed
    const actualFeed = await FeedModel.findById(path);

    // return object
    return {
      ...sanitised,

      feed : actualFeed.get('id'),
      name : actualFeed.get('name'),
    };
  }
}

// new feed app
export default new FeedApp();