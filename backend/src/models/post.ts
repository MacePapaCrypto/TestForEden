
import decay from 'decay';
import Model, { Type } from '../base/model';
import FeedUtility from '../utilities/feed';
import ContextModel from './context';
import SegmentModel from './segment';

/**
 * export model
 */
@Type('post')
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
  getContext() {
    // get segment
    return this.get('context') && ContextModel.findById(this.get('context'));
  }

  /**
   * get segment
   * 
   * @returns 
   */
  getSegment() {
    // get segment
    return this.get('segment') && SegmentModel.findById(this.get('segment'));
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
   * find posts by account
   *
   * @param account 
   */
  static findByAccount(account, ...args) {
    // find by ref
    return PostModel.findByRef(`account:${account}`, ...args);
  }
  
  /**
   * find posts by segment
   *
   * @param segment 
   */
   static findBySegment(segment, ...args) {
    // find by ref
    return PostModel.findByRef(`segment:${segment}`, ...args);
  }
  
  /**
   * find posts by context
   *
   * @param context 
   */
   static findByContext(context, ...args) {
    // find by ref
    return PostModel.findByRef(`context:${context}`, ...args);
  }

  /**
   * to json
   */
  async toJSON(loadCache = {}) {
    // get parent
    const parentJSON = await super.toJSON();

    // fix context
    if (this.get('context')) {
      // create new promise
      // @todo memory leak, move to timed release
      if (!loadCache[this.get('context')]) loadCache[this.get('context')] = new Promise(async (resolve) => {
        // load
        const actualContext = await this.getContext();
        resolve(await actualContext.toJSON());
      });

      // await
      parentJSON.context = await loadCache[this.get('context')];
    }

    // return parent
    return parentJSON;
  }

  /**
   * Saves the current model
   */
  public async save(emitter = null): Promise<any> {
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
      'count.upvotes',
      'count.replies',
      'count.downvotes',
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
    const upvoteRanking = (this.get('count.upvotes') || 0) + ((this.get('count.replies') || 0) * 3);

    // set rank
    this.set('rank', {
      score  : round(decay.redditHot()(upvoteRanking, this.get('count.downvotes'), created)),
      reddit : round(decay.redditHot()(upvoteRanking, this.get('count.downvotes'), created)),
      hacker : round(decay.hackerHot()(upvoteRanking, created)),
      wilson : round(decay.wilsonScore()(upvoteRanking, this.get('count.downvotes')))
    });

    // return super
    const saving = await super.save(emitter);

    // run helper shit
    FeedUtility.post(this);

    // return saving
    return saving;
  }
}