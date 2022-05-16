
// importe dependencies
import FeedModel from '../models/feed';
import SpaceModel from '../models/space';
import FollowModel from '../models/follow';

// embed utility
class FeedUtility {

  /**
   * feed utility
   *
   * @param post 
   */
  async post(post) {
    // find all feeds by all refs
    const refs = Array.from(new Set(post.get('refs') || []));

    // promise all
    await Promise.all(refs.map(async (ref) => {
      // load all feeds
      const feeds = await FeedModel.findByRef(`${ref}`);

      // loop
      await Promise.all(feeds.map(async (feed) => {
        // add post to feed
        return feed.addPost(post);
      }));
    }));
  }
  
  /**
   * create account feed
   *
   * @param account 
   */
  async account(account, force = false) {
    // to lower case
    account = account.toLowerCase();

    // find feed
    const existingFeed = await FeedModel.findByAccount(account);

    // check existing
    if (!force && existingFeed) return existingFeed;

    // set feed
    const actualFeed = existingFeed || new FeedModel({
      id : `account:${account}`,
    });

    // sorts
    actualFeed.set('sorts', ['rank.score', 'createdAt']);

    // refs
    if (!actualFeed.get('refs')) actualFeed.set('refs', []);

    // get refs
    const refs = new Set(actualFeed.get('refs'));

    // add refs
    const [
      spaces,
      following,
    ] = await Promise.all([
      SpaceModel.findByAccount(account),
      FollowModel.findFollowing(account),
    ]);

    // loop segments
    spaces.map((space) => {
      // add to feed
      refs.add(`space:${space.get('id')}`);
    });
    following.map((follow) => {
      // add to feed
      refs.add(`account:${follow.get('to')}`);
    });
    
    // save feed
    actualFeed.set('refs', Array.from(refs));
    actualFeed.save();
  }
}

// export defualt
export default new FeedUtility();