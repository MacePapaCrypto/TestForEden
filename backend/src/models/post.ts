
import decay from 'decay';
import Model, { Type } from '../base/model';
import UserModel from './user';
import LikeModel from './like';
import SpaceModel from './space';
import FeedUtility from '../utilities/feed';

/**
 * export model
 */
@Type('post', 'post')
export default class PostModel extends Model {
  /**
   * construct
   *
   * @param args
   */
  constructor(data = {}) {
    // run super
    super(data);
    
    // embeds
    if (!Array.isArray(this.__data.embeds)) this.__data.embeds = [];
  }

  /**
   * get segment
   * 
   * @returns 
   */
  getUser() {
    // get segment
    return this.get('account') && UserModel.findById(this.get('account'));
  }

  /**
   * get segment
   * 
   * @returns 
   */
  getSpace() {
    // get segment
    return this.get('space') && SpaceModel.findById(this.get('space'));
  }

  /**
   * find by id
   *
   * @param id
   */
  static async findByFeed(feed: string, limit: number = 25, sort: string = 'createdAt', direction: 'asc' | 'desc' = 'desc', lastSort: number | null = null): Promise<Array<any>> {
    // check id
    if (!feed) return [];

    // execute schema create
    const data = await PostModel.query(`SELECT * FROM feeds_${direction} WHERE feed = ? AND key = ?${lastSort ? ` AND sort ${direction === 'asc' ? '>' : '<'} ?` : ''} LIMIT ${limit}`,
      lastSort ? [`${feed}`, sort, lastSort] : [`${feed}`, sort]
    );

    // get data
    return (await Promise.all(data.rows.map((row) => {
      // return constructor
      return this.findById(row.model_id);
    }))).filter((r) => r);
  }
  
  /**
   * find posts by thread
   *
   * @param thread 
   */
  static findByThread(thread, ...args) {
    // find by ref
    return PostModel.findByRef(`thread:${thread}`, ...args);
  }
  
  /**
   * find posts by thread
   *
   * @param thread 
   */
  static findByThreadAccount(thread, account, ...args) {
    // find by ref
    return PostModel.findByRef(`thread:${thread}:${account}`.toLowerCase(), ...args);
  }

  
  
  /**
   * find posts by thread
   *
   * @param thread 
   */
  static findByResponse(thread, ...args) {
    // find by ref
    return PostModel.findByRef(`reply:${thread}`, ...args);
  }
  
  /**
   * find posts by account
   *
   * @param account 
   */
  static findByAccount(account, ...args) {
    // find by ref
    return PostModel.findByRef(`account:${account}`, ...args);
  }
  
  /**
   * find posts by account
   *
   * @param account 
   */
  static findByAccountPublic(account, ...args) {
    // find by ref
    return PostModel.findByRef(`account:public:${account}`, ...args);
  }
  
  /**
   * find posts by segment
   *
   * @param space 
   */
   static findBySpace(space, ...args) {
    // find by ref
    return PostModel.findByRef(`space:${space}`, ...args);
  }
  
  /**
   * find posts by segment
   *
   * @param space 
   */
   static findBySubSpace(space, ...args) {
    // find by ref
    return PostModel.findByRef(`subspace:${space}`, ...args);
  }

  /**
   * to json
   */
  async toJSON(loadCache = {}, account = null, replies = 0) {
    // get parent
    const parentJSON = await super.toJSON();

    // loads
    const loads = [];

    // fix context
    if (this.get('space')) {
      // create new promise
      if (!loadCache[this.get('space')]) loadCache[this.get('space')] = (async () => {
        // load
        const actualSpace = await this.getSpace();

        // return
        return actualSpace ? await actualSpace.toJSON(loadCache, account, true) : null;
      })();

      // await
      loads.push((async () => {
        parentJSON.space = await loadCache[this.get('space')];
      })());
    }

    // reply
    if (this.get('reply') && replies) {
      // create new promise
      if (!loadCache[this.get('reply')]) loadCache[this.get('reply')] = (async () => {
        // load
        const parentPost = await PostModel.findById(this.get('reply'));

        // return
        return parentPost ? await parentPost.toJSON(loadCache, account) : null;
      })();

      // await
      loads.push((async () => {
        parentJSON.replyTo = await loadCache[this.get('reply')];
      })());
    }

    // fix account
    if (this.get('account')) {
      // lower account
      const lowerAccount = this.get('account').toLowerCase();

      // create new promise
      if (!loadCache[lowerAccount]) loadCache[lowerAccount] = (async () => {
        // load
        const actualUser = await this.getUser();

        // check user
        return actualUser ? await actualUser.toJSON(loadCache, !account) : null;
      })();

      // await
      loads.push((async () => {
        parentJSON.user = await loadCache[lowerAccount];
      })());
    }

    // if account
    if (account && replies) {
      // lower account
      const lowerAccount = (account?.id || account).toLowerCase();

      // create new promise
      if (!loadCache[`${this.id}.liked`]) loadCache[`${this.id}.liked`] = (async () => {
        // load like
        const actualLike = await LikeModel.isLiked(lowerAccount, this.id);

        // check user
        return actualLike ? await actualLike.toJSON() : null;
      })();

      // create new promise
      if (!loadCache[`${this.id}.replied`]) loadCache[`${this.id}.replied`] = (async () => {
        // load like
        const actualReplied = (await PostModel.findByThreadAccount(this.id, lowerAccount, 1) || [])[0];

        // check user
        return actualReplied ? true : null;
      })();

      // await
      loads.push((async () => {
        parentJSON.liked = await loadCache[`${this.id}.liked`];
      })());

      // await
      loads.push((async () => {
        parentJSON.replied = await loadCache[`${this.id}.replied`];
      })());
    }

    // check count
    if (this.get('count.replies') && replies) {
      // create new promise
      if (!loadCache[`${this.id}.children`]) loadCache[`${this.id}.children`] = (async () => {
        // load
        return await Promise.all((await PostModel.findByResponse(this.id, replies)).map((child) => child.toJSON(loadCache, account)));
      })();

      // await
      loads.push((async () => {
        parentJSON.children = await loadCache[`${this.id}.children`];
      })());
    }

    // promise all
    await Promise.all(loads);

    // return parent
    return parentJSON;
  }

  /**
   * Saves the current model
   */
  public async save(noEmission = null): Promise<any> {
    // set sort
    if (!Array.isArray(this.__data.sorts)) this.__data.sorts = [];

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
      'count.likes',
      'count.replies',
      'count.reactions',
    ];

    // push sorts
    [
      // ranking types
      ...ranks,

      // count types
      ...counts,
    ].forEach((sortKey) => {
      // check and add
      if (!this.__data.sorts.includes(sortKey)) this.__data.sorts.push(sortKey);
    });

    // fix counts
    counts.forEach((count) => {
      // check and default
      if (!this.get(count)) this.set(count, 0);
    });

    // created
    const created = new Date(this.__data.createdAt || new Date());

    // round
    const round = (number) => {
      // return rounded
      return parseFloat(number.toFixed(5));
    };

    // ranking
    const upvoteRanking = (this.get('count.likes') || 0) + ((this.get('count.replies') || 0) * 3);
    const downvoteRanking = 0;

    // set rank
    this.set('rank', {
      score  : round(decay.redditHot()(upvoteRanking, downvoteRanking, created)),
      reddit : round(decay.redditHot()(upvoteRanking, downvoteRanking, created)),
      hacker : round(decay.hackerHot()(upvoteRanking, created)),
      wilson : round(decay.wilsonScore()(upvoteRanking, downvoteRanking))
    });

    // return super
    const saving = await super.save(noEmission);

    // run helper shit
    FeedUtility.post(this);

    // return saving
    return saving;
  }
}