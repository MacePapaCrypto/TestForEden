
// import local
import PostModel from '../models/post';
import FeedModel from '../models/feed';
import NFTController, { Route } from '../base/controller';

/**
 * create auth controller
 */
export default class FeedController extends NFTController {

  /**
   * listen for post
   *
   * @param socket 
   * @param post 
   */
  async postListener(socket, post) {
    // get post
    const actualPost = await PostModel.findById(post.id);

    // send post to socket
    socket.emit('post', await actualPost.toJSON({}, 5));
  }

  /**
   * listen for post
   *
   * @param socket 
   * @param post 
   */
  typingListener(socket, thread, user) {
    // send post to socket
    socket.emit('typing', thread, user);
  }

  /**
   * post get endpoint
   * 
   * @returns
   */
  @Route('GET', '/feed/:feed')
  async listAction(req, { data, params }, next) {
    // check segment
    const feed = params.feed;
    
    // actual feed
    const actualFeed = await FeedModel.findById(feed);

    // check feed
    if (!actualFeed) return {
      result  : [],
      success : false,
      message : 'Feed not found',
    }

    // get sorts
    const sorts = actualFeed.get('sorts');

    // sort
    const sort = sorts.find(c => c.includes(data.sort)) || sorts[0];
    const last = data.last ? parseFloat(data.last) : null;
    const limit = parseInt(data.l || data.limit || '25');
    const direction = ['asc', 'desc'].includes(data.dir) ? data.dir : 'desc';

    // create args
    const args = last ? [limit, sort, direction, last] : [limit, sort, direction];

    // posts
    const actualPosts = await actualFeed.findPosts(...args);

    // if listen string
    if (req.subscribe) {
      // loop posts
      actualPosts.forEach((post) => {
        // subscribe
        req.subscribe(`post:${post.get('id')}`, this.postListener);
        req.subscribe(`typing+thread:${post.get('id')}`, this.typingListener);
      });
    }

    // load cache
    const loadCache = {};

    // return
    return {
      result  : await Promise.all(actualPosts.map((post) => post.toJSON(loadCache, 5))),
      success : true,
    };
  }
}