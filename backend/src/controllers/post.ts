
// import local
import PostModel from '../models/post';
import LikeModel from '../models/like';
import SpaceModel from '../models/space';
import embedUtility from '../utilities/embed';
import NFTController, { Route } from '../base/controller';

/**
 * create auth controller
 */
export default class PostController extends NFTController {

  /**
   * listen for post
   *
   * @param socket 
   * @param post 
   */
  singlePostListener(socket, post) {
    // send post to socket
    socket.emit('post', post);
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
   * listen for post
   *
   * @param socket 
   * @param post 
   */
  async postListener(socket, post) {
    // get post
    const actualPost = await PostModel.findById(post.id);

    // send post to socket
    socket.emit('post', await actualPost.toJSON({}, socket.account, 5));
  }

  /**
   * 
   * @param req 
   * @param param1 
   * @param next 
   */
  @Route('POST', '/api/v1/typing/:thread')
  async typingAction(req, { data, params }, next) {
    // only thread for now
    const thread = params.thread;
    const typing = typeof data.typing === 'undefined' ? true : data.typing === 'true';

    // check thread
    if (!thread) return {
      success : false,
      message : 'No thread specified',
    };

    // listen string
    const listenStr = `${thread.includes('thread:') ? thread : `thread:${thread}`}`;

    // emit to thread
    this.base.pubsub.emit(`typing+${listenStr}`, listenStr, {
      typing  : typing ? new Date() : false,
      account : req.account,
    });

    // success
    return {
      result  : !!typing,
      success : true,
    };
  }

  /**
   * post get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/post')
  async listAction(req, { data, params }, next) {
    // check segment
    const feed = (data.f || data.feed) ? (data.f || data.feed).toLowerCase() : null;
    const space = (data.c || data.space) ? (data.c || data.space).toLowerCase() : null;
    const thread = (data.t || data.thread) ? (data.t || data.thread).toLowerCase() : null;
    const account = (data.a || data.account) ? (data.a || data.account).toLowerCase() : null;

    // normals
    const normals = [
      'updatedAt',
      'createdAt',
    ];
    // rank types
    const ranks = [
      'rank.score',
      'rank.reddit',
      'rank.hacker',
      'rank.wilson',
    ];
    // count types
    const counts = [
      'count.tips',
      'count.votes',
      'count.upvotes',
      'count.replies',
      'count.downvotes',
      'count.reactions',
    ];

    // sort
    const sort = [...ranks, ...counts, ...normals].find(c => c.includes(data.sort)) || 'rank.score';
    const last = data.last ? parseFloat(data.last) : null;
    const limit = parseInt(data.l || data.limit || '25');
    const direction = ['asc', 'desc'].includes(data.dir) ? data.dir : 'desc';

    // create args
    const args = last ? [limit, sort, direction, last] : [limit, sort, direction];

    // contexts
    let listenStr = null;
    let actualPosts = [];

    // check section
    if (thread) {
      listenStr = `thread:${thread}`;
      actualPosts = await PostModel.findByThread(thread, ...args);
    } else if (space) {
      listenStr = `space:${space}`;
      actualPosts = await PostModel.findBySpace(space, ...args);
    } else if (account) {
      listenStr = `account:public:${account}`;
      actualPosts = await PostModel.findByAccountPublic(account, ...args);
    }

    // if listen string
    if (req.subscribe && listenStr) {
      // subscribe
      req.subscribe(`post+${listenStr}`, ['hot', 'new'].includes(feed) ? this.postListener : this.singlePostListener);

      // check feed
      if (thread) {
        // subscribe to typing
        req.subscribe(`typing+${listenStr}`, this.typingListener);
      }
    }

    // load cache
    const loadCache = {};

    // return
    return {
      result  : await Promise.all(actualPosts.map((post) => post.toJSON(loadCache, req.account, ['hot', 'new'].includes(feed) ? 5 : 0))),
      success : true,
    };
  }

  /**
   * post get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/post/:id')
  async getAction(req, { data, params }, next) {
    // get post
    const post = await PostModel.findById(params.id);

    // subscribe
    if (post) {
      // subscriptions
      req.subscribe(`post:${post.id}`, this.singlePostListener);
    }

    // return post
    return {
      result  : post ? await post.toJSON({}, req.account) : null,
      success : !!post,
    };
  }

  /**
   * post like endpoint
   * 
   * @returns
   */
  @Route('POST', '/api/v1/like/:id')
  async likeAction(req, { data, params }, next) {
    // get post
    const post = await PostModel.findById(params.id);

    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // let done/count
    let like, count;

    // subscribe
    if (post) {
      // subscriptions
      const actualLike = await LikeModel.isLiked(lowerAccount, post.id);

      // check like
      if (actualLike) {
        // remove
        [like, count] = await actualLike.remove();
      } else {
        // remove
        [like, count] = await LikeModel.addLike(lowerAccount, post.id, 'post');
      }
    }

    // return post
    return {
      result : {
        like,
        count,
      },
      success : !!post,
    };
  }

  /**
   * post create endpoint
   *
   * @returns 
   */
  @Route('POST', '/api/v1/post')
  async createAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      result  : 'Account Required',
      success : false,
    };

    // refs
    const refs = [`account:${lowerAccount}`];

    // thread
    const thread = data.thread ? data.thread.toLowerCase() : null;
    const actualThread = thread && await PostModel.findById(thread);

    // check thread
    if (actualThread) {
      refs.push(`thread:${actualThread.id}`);
      refs.push(`thread:${actualThread.id}:${lowerAccount}`);
    }

    // source
    const space = data.subSpace ? data.subSpace.toLowerCase() : (data.space ? data.space.toLowerCase() : null);
    const actualSpace = space && await SpaceModel.findById(space);

    // get space
    if (actualSpace) {
      // in subspace
      refs.push(`space:${actualSpace.id}`);
    }
    if (actualSpace && (actualSpace.get('space') && actualSpace.get('feed') !== 'chat')) {
      // check feed
      refs.push(`space:${actualSpace.get('space')}`);
    }

    // @todo temp make everything public
    if (data.feed !== 'chat' && (!actualSpace || actualSpace.get('feed') !== 'chat')) {
      // push user public
      refs.push(`public:${lowerAccount}`);

      // only op
      if (!actualThread) refs.push('public');
    }
    if (actualThread && data.feed === 'response') {
      refs.push(`reply:${actualThread.id}`);
    }
    
    // create default segment
    const newPost = new PostModel({
      refs    : refs,
      temp    : data.temp || data.tempId,
      content : data.content,
      account : lowerAccount,

      space  : actualSpace ? actualSpace.id : null,
      reply  : actualThread && data.feed === 'response' ? actualThread.id : null,
      thread : actualThread ? actualThread.id : null,
    });

    // save
    await newPost.save();

    // actual post
    if (actualThread) {
      // add count
      if (!actualThread.get('count.replies')) actualThread.set('count.replies', 0);

      // add reply
      actualThread.set('count.replies', actualThread.get('count.replies') + 1);
      actualThread.save();
    }

    // do embeds in background
    embedUtility.post(newPost);

    // return
    return {
      result  : await newPost.toJSON({}, req.account),
      success : true,
    };
  }

  /**
   * post delete endpoint
   *
   * @returns 
   */
  @Route('DELETE', '/api/v1/post/:id')
  async deleteAction(req, { data, params }, next) {
    // get message/signature
    const { id } = params;

    // success
    return {
      result  : {},
      success : true,
    };
  }

  /**
   * post toggle reaction endpoint
   *
   * @returns 
   */
  @Route('POST', '/api/v1/post/:id/react')
  async reactAction(req, { data, params }, next) {
    // get message/signature
    const { emoji } = data;
    const { id } = params;

    // success
    return {
      result  : {},
      success : true,
    };
  }

  /**
   * post react endpoint
   *
   * @returns 
   */
  @Route('POST', '/api/v1/post/:id/reply')
  async replyAction(req, { data, params }, next) {
    // get message/signature
    const { id } = params;

    // success
    return {
      result  : {},
      success : true,
    };
  }

  /**
   * post react endpoint
   *
   * @returns 
   */
  @Route('DELETE', '/api/v1/post/:id/reply/:reply')
  async deleteReplyAction(req, { data, params }, next) {
    // get message/signature
    const { id, reply } = params;

    // success
    return {
      result  : {},
      success : true,
    };
  }
}