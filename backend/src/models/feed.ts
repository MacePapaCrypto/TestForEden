
import Model from '../base/model';
import PostModel from './post';

/**
 * export model
 */
export default class FeedModel extends Model {
  /**
   * construct
   *
   * @param args
   */
  constructor(data = {}) {
    // run super
    super(data);

    // set data
    this.__data = data;

    // fix cammel case
    this.__data.createdAt = this.__data.createdAt || this.__data.created_at || new Date();
    this.__data.updatedAt = this.__data.updatedAt || this.__data.updated_at || new Date();

    // delete
    delete this.__data.created_at;
    delete this.__data.updated_at;

    // check refs/subjects
    if (!this.__data.refs) this.__data.refs = [];
  }

  /**
   * Saves the current model
   */
  public async save(emitter = null): Promise<any> {
    // create promises array
    const queries = [];

    // check id
    if (!this.__data.id) return;

    // set id if not exists
    if (!this.__data.createdAt) this.__data.createdAt = new Date();

    // check sorts
    if (!this.__data.refs) this.__data.refs = [];
    if (!this.__data.sorts) this.__data.sorts = [];

    // check created/updated
    this.__data.updatedAt = new Date();

    // keys
    const keys = ['id', 'sorts', 'refs', 'version', 'created_at', 'updated_at'];

    // create query
    const query = `INSERT INTO feeds (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;

    // fix data
    const data = keys.map((key) => {
      // check key
      if (key === 'version') return `${this.__data[key] || '0.0.1'}`;
      if (key === 'created_at') return this.__data.createdAt;
      if (key === 'updated_at') return this.__data.updatedAt;
      
      // return data
      if (['refs'].includes(key) && !Array.isArray(this.__data[key])) return [];
      if (['sorts'].includes(key) && !Array.isArray(this.__data[key])) return [];

      // data key
      return this.__data[key];
    });

    // execute schema create
    queries.push({
      query,
      params : data
    });

    // clear existing refs
    const actualRefs = [];
    const existingRefs = await this.getRefs();

    // loop refs
    (this.__data.refs || []).forEach((ref) => {
      // push actual refs
      actualRefs.push(`${ref}`);

      // add ref1
      ['feeds_by_ref', 'refs_by_feed'].forEach((table) => {
        // add queries
        queries.push({
          query  : `INSERT INTO ${table} (ref, feed) VALUES (?, ?)`,
          params : [`${ref}`, this.__data.id],
        });
      });
    });

    // remove old refs
    existingRefs.filter((ref) => {
      // check includes
      return !actualRefs.includes(`${ref.ref}`);
    }).forEach(({ ref }) => {
      // delete from
      ['feeds_by_ref', 'refs_by_feed'].forEach((table) => {
        // add queries
        queries.push({
          query  : `DELETE FROM ${table} where ref = ? AND feed = ?`,
          params : [ref, this.__data.id],
        });
      });
    });

    // await actual query
    await FeedModel.batch(queries);

    // chainable
    return this;
  }

  /**
   * adds post to feed
   *
   * @param post 
   */
  public async addPost(post) {
    // create queries array
    const queries = [];

    // clear existing refs
    const actualRefs = [];
    const existingRefs = await this.getModelRefs(post.get('id'));
    
    // loop sorts
    (this.__data.sorts || []).forEach((sort) => {
      // get value
      let value = post.get(sort);

      // check value
      if (value instanceof Date && typeof value?.getTime === 'function') value = value.getTime();

      // check value
      if (typeof value === 'undefined') return;

      // push actual refs
      actualRefs.push(`${sort}:${value}`);

      // add ref1
      ['feeds_desc', 'feeds_asc', 'feeds_by_model'].forEach((table) => {
        // add queries
        queries.push({
          query  : `INSERT INTO ${table} (feed, key, model_id, value) VALUES (?, ?, ?, ?)`,
          params : [`${this.get('id')}`, `${sort}`, post.get('id'), value],
        });
      });
    });

    // remove old refs
    existingRefs.filter((ref) => {
      // check includes
      return !actualRefs.includes(`${ref.key}:${ref.value}`);
    }).forEach(({ key, value }) => {
      // delete from
      ['feeds_desc', 'feeds_asc', 'feeds_by_model'].forEach((table) => {
        // add queries
        queries.push({
          query  : `DELETE FROM ${table} where feed = ? AND key = ? AND model_id = ? AND value = ?`,
          params : [`${this.get('id')}`, `${key}`, post.get('id'), value],
        });
      });
    });

    // await actual query
    await FeedModel.batch(queries);
  }

  /**
   * get refs
   *
   * @returns 
   */
  async getRefs(): Promise<Array<any>> {
    // execute schema create
    const data = await FeedModel.query('SELECT * FROM refs_by_feed WHERE feed = ?', [this.__data.id]);

    // get data
    return data.rows;
  }

  /**
   * get refs
   *
   * @returns 
   */
  async getModelRefs(model_id): Promise<Array<any>> {
    // execute schema create
    const data = await FeedModel.query('SELECT * FROM feeds_by_model WHERE model_id = ?', [model_id]);

    // get data
    return data.rows;
  }

  /**
   * find by id
   *
   * @param id
   */
  static async findById(id: string): Promise<any> {
    // check id
    if (!id) return null;

    // execute schema create
    const data = await FeedModel.query('SELECT * FROM feeds WHERE id = ?', [id]);

    // get data
    return data?.rows && data.rows[0] ? new this(data.rows[0]) : null;
  }

  /**
   * find by id
   *
   * @param id
   */
  async findPosts(limit: number = 25, sort: string = 'createdAt', direction: 'asc' | 'desc' = 'desc', lastSort: number | null = null): Promise<Array<any>> {
    // execute schema create
    const data = await FeedModel.query(`SELECT * FROM feeds_${direction} WHERE feed = ? AND key = ?${lastSort ? ` AND sort ${direction === 'asc' ? '>' : '<'} ?` : ''} LIMIT ${limit}`,
      lastSort ? [this.__data.id, sort, lastSort] : [this.__data.id, sort]
    );

    // get data
    return (await Promise.all(data.rows.map((row) => {
      // return constructor
      return PostModel.findById(row.model_id);
    }))).filter((r) => r);
  }

  /**
   * find by id
   *
   * @param id
   */
  static async findByRef(ref: string, limit: number = 1000): Promise<Array<any>> {
    // check id
    if (!ref) return [];

    // execute schema create
    const data = await FeedModel.query(`SELECT * FROM feeds_by_ref WHERE ref = ? LIMIT ${limit}`, [ref]);

    // get data
    return (await Promise.all(data.rows.map((row) => {
      // return constructor
      return this.findById(row.feed);
    }))).filter((r) => r);
  }

  /**
   * find feed by account
   *
   * @param account 
   */
  static async findByAccount(account) {
    // find
    return FeedModel.findById(`account:${account}`);
  }
}