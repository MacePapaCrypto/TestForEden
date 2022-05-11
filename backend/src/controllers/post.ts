
// import local
import PostModel from '../models/post';
import ContextModel from '../models/context';
import SegmentModel from '../models/segment';
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
    socket.emit('post', await actualPost.toJSON({}, 5));
  }

  /**
   * 
   * @param req 
   * @param param1 
   * @param next 
   */
  @Route('POST', '/typing/:thread')
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
  @Route('GET', '/post')
  async listAction(req, { data, params }, next) {
    // check segment
    const feed = (data.f || data.feed) ? (data.f || data.feed).toLowerCase() : null;
    const thread = (data.t || data.thread) ? (data.t || data.thread).toLowerCase() : null;
    const context = (data.c || data.context) ? (data.c || data.context).toLowerCase() : null;
    const segment = (data.s || data.segment) ? (data.s || data.segment).toLowerCase() : null;
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
    } else if (context) {
      listenStr = `context:${context}`;
      actualPosts = await PostModel.findByContext(context, ...args);
    } else if (segment) {
      listenStr = `segment:${segment}`;
      actualPosts = await PostModel.findBySegment(segment, ...args);
    } else if (account) {
      listenStr = `account:public:${account}`;
      actualPosts = await PostModel.findByAccountPublic(account, ...args);
    }

    // if listen string
    if (req.subscribe && listenStr) {
      // subscribe
      req.subscribe(`post+${listenStr}`, feed === 'feed' ? this.postListener : this.singlePostListener);

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
      result  : await Promise.all(actualPosts.map((context) => context.toJSON(loadCache, feed === 'feed' ? 5 : 0))),
      success : true,
    };
  }

  /**
   * post get endpoint
   * 
   * @returns
   */
  @Route('GET', '/post/:id')
  async getAction(req, { data, params }, next) {
    // get post
    const post = await PostModel.findById(params.id);

    // subscribe
    if (post) {
      // subscriptions
      req.subscribe(`post:${post.get('id')}`, this.singlePostListener);
    }

    // return post
    return {
      result  : post ? await post.toJSON() : null,
      success : !!post,
    };
  }

  /**
   * post create endpoint
   *
   * @returns 
   */
  @Route('POST', '/post')
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
    if (actualThread) refs.push(`thread:${actualThread.get('id')}`);

    // source
    const context = data.context ? data.context.toLowerCase() : null;
    const actualContext = context && await ContextModel.findById(context);

    // check context
    if (actualContext) refs.push(`context:${actualContext.get('id')}`);

    // segment
    const segment = actualContext ? await actualContext.get('segment') : (data.segment ? data.segment.toLowerCase() : null);
    const actualSegment = segment && await SegmentModel.findById(segment);

    // check segment
    if (actualSegment) refs.push(`segment:${actualSegment.get('id')}`);

    // @todo temp make everything public
    if (!actualThread && data.feed !== 'chat') {
      refs.push('public');
      refs.push(`account:public:${lowerAccount}`);
    }
    
    // create default segment
    const createdPost = new PostModel({
      refs    : refs,
      temp    : data.temp || data.tempId,
      content : data.content,
      account : lowerAccount,

      thread  : actualThread ? actualThread.get('id') : null,
      segment : actualSegment ? actualSegment.get('id') : null,
      context : actualContext ? actualContext.get('id') : null,
    });

    // save
    await createdPost.save();

    // actual post
    if (actualThread) {
      // add count
      if (!actualThread.get('count.replies')) actualThread.set('count.replies', 0);

      // add reply
      actualThread.set('count.replies', actualThread.get('count.replies') + 1);
      actualThread.save();
    }

    // do embeds in background
    embedUtility.post(createdPost);

    // return
    return {
      result  : await createdPost.toJSON(),
      success : true,
    };
  }

  /**
   * post delete endpoint
   *
   * @returns 
   */
  @Route('DELETE', '/post/:id')
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
  @Route('POST', '/post/:id/react')
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
  @Route('POST', '/post/:id/reply')
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
  @Route('DELETE', '/post/:id/reply/:reply')
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