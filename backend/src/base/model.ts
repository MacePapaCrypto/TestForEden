import 'reflect-metadata';

// Import aliases
import _ from 'lodash';
import equal from 'deep-equal';
import JSON5 from 'json5';
import Events from 'events';
import dotProp from 'dot-prop';
import { chunks } from 'chunk-array';
import { customAlphabet } from 'nanoid';

// create alphabet
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 40);

// globals
let base, client, pubsub, logger;

/**
 * Exports decorator function to set type of model
 */
export function Type(type: string, preface?: string) {
  // return function
  return (target: any) => {
    // Add namespace and subspace
    Reflect.defineMetadata('model:type', type, target);
    if (preface) Reflect.defineMetadata('model:preface', preface, target);
  };
}

/**
 * Create Controller class
 */
export default class NFTModel extends Events {
  private __changed: boolean = false;
  
  /**
   * construct
   *
   * @param args
   */
  constructor(data = {}) {
    // run super
    super();

    // set data
    this.__data = data;
    
    // date
    if (typeof this.__data.data === 'string') {
      // expound data
      const data = JSON5.parse(this.__data.data);

      // loop
      Object.keys(data).forEach((key) => {
        this.__data[key] = data[key];
      });
    }

    // fix cammel case
    this.__data.createdAt = this.__data.createdAt || this.__data.created_at || new Date();
    this.__data.updatedAt = this.__data.updatedAt || this.__data.updated_at || new Date();

    // delete
    delete this.__data.data;
    delete this.__data.created_at;
    delete this.__data.updated_at;

    // check refs/subjects
    if (!this.__data.refs) this.__data.refs = [];
  }

  /**
   * build
   *
   * @param base 
   */
  static build(actualBase) {
    // set globals
    base = actualBase;
    pubsub = actualBase.pubsub;
    logger = actualBase.logger;
    client = actualBase.client;
  }

  /**
   * creates id
   */
  get id () {
    // returns new id
    if (!this.__data.id) {
      this.__data.id = nanoid();
      this.__changed = true;
    }

    // return id
    return this.__data.id;
  }

  /**
   * get pubsub
   */
  static get client () {
    // get pubsub
    return client;
  }

  /**
   * get pubsub
   */
  static get pubsub () {
    // get pubsub
    return pubsub;
  }

  /**
   * gets value
   *
   * @param {*} key 
   */
  public get(key) {
    // get
    return dotProp.get(this.__data, key);
  }

  /**
   * sets value
   *
   * @param {*} key
   * @param {*} value
   */
  public set(key, value) {
    // check change
    const changed = !equal(dotProp.get(this.__data, key), value);

    // if changed
    if (changed) this.__changed = true;
  
    // get
    return this.__data = dotProp.set(this.__data, key, value);
  }

  /**
   * Saves the current model
   */
  public async save(noEmission = null, force = false): Promise<any> {
    // Load namespace and subspace
    const type = Reflect.getMetadata('model:type', this.constructor);
    const preface = Reflect.getMetadata('model:preface', this.constructor);

    // create promises array
    const queries = [];

    // set create
    const creating = !this.__data.id || !this.__data.createdAt;

    // no need to save if nothing has changed
    if (!force && !creating && !this.__changed) return;

    // set id if not exists
    if (!this.__data.id) this.__data.id = `${nanoid()}`;
    if (!this.__data.createdAt) this.__data.createdAt = new Date();

    // check sorts
    if (!this.__data.sorts) this.__data.sorts = [];
    if (!this.__data.sorts.includes('createdAt')) this.__data.sorts.push('createdAt');
    if (!this.__data.sorts.includes('updatedAt')) this.__data.sorts.push('updatedAt');

    // check created/updated
    this.__data.updatedAt = new Date();

    // keys
    const keys = ['id', 'type', 'data', 'sorts', 'refs', 'version', 'created_at', 'updated_at'];

    // create query
    const query = `INSERT INTO ${preface ? `${preface}_` : ''}models (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;

    // fix data
    const data = keys.map((key) => {
      // check key
      if (key === 'type') return `${type}`;
      if (key === 'version') return `${this.__data[key] || '0.0.1'}`;
      if (key === 'created_at') return this.__data.createdAt;
      if (key === 'updated_at') return this.__data.updatedAt;

      // expound data
      if (key === 'data') return JSON5.stringify(Object.keys(this.__data).reduce((accum, k) => {
        // add data
        if (!['type'].includes(k) && (keys.includes(k) || ['updatedAt', 'createdAt'].includes(k))) return accum;

        // add key
        accum[k] = this.__data[k];

        // return accum
        return accum;
      }, {}));
      
      // return data
      if (['refs', 'sorts'].includes(key) && !Array.isArray(this.__data[key])) return [];
      if (['refs', 'sorts'].includes(key)) return Array.from(new Set(this.__data[key]));

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
      // loop sorts
      (this.__data.sorts || []).forEach((sort) => {
        // get value
        let value = dotProp.get(this.__data, sort);

        // check value
        if (value instanceof Date && typeof value?.getTime === 'function') value = value.getTime();

        // check value
        if (typeof value === 'undefined') return;

        // push actual refs
        actualRefs.push(`${ref}:${sort}:${value}`);

        // add ref1
        ['refs_desc', 'refs_asc', 'refs_by_model'].forEach((table) => {
          // add queries
          queries.push({
            query  : `INSERT INTO ${preface ? `${preface}_` : ''}${table} (ref, type, key, value, model_id) VALUES (?, ?, ?, ?, ?)`,
            params : [`${ref}`, `${type}`, sort, value, this.__data.id],
          });
        });
      });
    });

    // remove old refs
    existingRefs.filter((ref) => {
      // check includes
      return !actualRefs.includes(`${ref.ref}:${ref.key}:${ref.value}`);
    }).forEach(({ ref, key, value }) => {
      // delete from
      ['refs_desc', 'refs_asc', 'refs_by_model'].forEach((table) => {
        // add queries
        queries.push({
          query  : `DELETE FROM ${preface ? `${preface}_` : ''}${table} where ref = ? AND type = ? AND key = ? AND value = ? AND model_id = ?`,
          params : [ref, type, key, value, this.__data.id],
        });
      });
    });

    // await actual query
    await NFTModel.batch(queries);

    // reset changed
    this.__changed = false;

    // filter refs
    const background = async () => {
      // to json
      const json = await this.toJSON();

      // emit
      pubsub.emit(`${type}:${json.id}`, json);

      // loop refs
      (this.get('refs') || []).forEach((ref) => {
        // emit to pubsub
        pubsub.emit(ref, type, json);
        pubsub.emit(`${type}+${ref}`, json);
      });
    };
    if (!noEmission) background();

    // chainable
    return this;
  }

  /**
   * Removes the model
   */
  async remove(noEmission = null) {
    // Load namespace and subspace
    const type = Reflect.getMetadata('model:type', this.constructor);
    const preface = Reflect.getMetadata('model:preface', this.constructor);

    // create promises array
    const queries = [];

    // get refs
    const refs = await this.getRefs();

    // push remove query
    queries.push({
      query  : 'DELETE FROM models WHERE id = ?',
      params : [this.__data.id],
    });

    // remove old refs
    refs.forEach(({ ref, key, value }) => {
      // delete from
      ['refs_desc', 'refs_asc', 'refs_by_model'].forEach((table) => {
        // add queries
        queries.push({
          query  : `DELETE FROM ${preface ? `${preface}_` : ''}${table} where ref = ? AND type = ? AND key = ? AND value = ? AND model_id = ?`,
          params : [ref, type, key, value, this.__data.id],
        });
      });
    });

    // filter refs
    const background = async () => {
      // to json
      const json = await this.toJSON();

      // emit
      pubsub.emit(`delete+${type}:${json.id}`, json);

      // loop refs
      (this.get('refs') || []).forEach((ref) => {
        // emit to pubsub
        pubsub.emit(`delete+${ref}`, type, json);
        pubsub.emit(`delete+${type}+${ref}`, json);
      });
    };
    if (!noEmission) background();

    // await actual query
    await NFTModel.batch(queries);
  }

  /**
   * get refs
   *
   * @returns 
   */
  async getRefs(): Promise<Array<any>> {
    // get preface
    const preface = Reflect.getMetadata('model:preface', this.constructor);

    // execute schema create
    const data = await NFTModel.query(`SELECT * FROM ${preface ? `${preface}_` : ''}refs_by_model WHERE model_id = ?`, [this.__data.id]);

    // get data
    return data.rows;
  }

  /**
   * add sort
   *
   * @param sort 
   * @param emitter 
   * @returns 
   */
  addSort(sort: string, emitter = null): Promise<any> {
    // push subject
    if (!Array.isArray(this.__data.sorts)) this.__data.sorts = [];

    // push subject
    this.__changed = true;
    this.__data.sorts.push(sort);

    // save
    return this.save(emitter);
  }

  /**
   * remove sort
   *
   * @param ref 
   * @param emitter 
   * @returns 
   */
  removeSort(sort: string, emitter = null): Promise<any> {
    // push subject
    if (!Array.isArray(this.__data.sorts)) this.__data.sorts = [];

    // push subject
    this.__changed = true;
    this.__data.sorts = this.__data.sorts.filter((s) => s !== sort);

    // save
    return this.save(emitter);
  }

  /**
   * add reference
   *
   * @param ref 
   * @param emitter 
   * @returns 
   */
  addRef(ref: string, emitter = null): Promise<any> {
    // push subject
    if (!Array.isArray(this.__data.refs)) this.__data.refs = [];

    // push subject
    this.__changed = true;
    this.__data.refs.push(ref);

    // save
    return this.save(emitter);
  }

  /**
   * remove ref
   *
   * @param ref 
   * @param emitter 
   * @returns 
   */
  removeRef(ref: string, emitter = null): Promise<any> {
    // push subject
    if (!Array.isArray(this.__data.refs)) this.__data.refs = [];

    // push subject
    this.__changed = true;
    this.__data.refs = this.__data.refs.filter((r) => r !== ref);

    // save
    return this.save(emitter);
  }

  /**
   * find by id
   *
   * @param id
   */
  static async findById(id: string): Promise<any> {
    // Load namespace and subspace
    const type = Reflect.getMetadata('model:type', this);
    const preface = Reflect.getMetadata('model:preface', this);
    
    // check id
    if (!id) return null;

    // execute schema create
    const data = await NFTModel.query(`SELECT * FROM ${preface ? `${preface}_` : ''}models WHERE id = ? AND type = ?`, [id, type]);

    // get data
    return data?.rows && data.rows[0] ? new this(data.rows[0]) : null;
  }

  /**
   * find by id
   *
   * @param id
   */
  static async findByRef(ref: string, limit: number = 25, sort: string = 'createdAt', direction: 'asc' | 'desc' = 'desc', lastSort: number | null = null): Promise<Array<any>> {
    // Load namespace and subspace
    const type = Reflect.getMetadata('model:type', this);
    const preface = Reflect.getMetadata('model:preface', this);
    
    // check id
    if (!ref) return [];

    // execute schema create
    const data = await NFTModel.query(`SELECT * FROM ${preface ? `${preface}_` : ''}refs_${direction} WHERE ref = ? AND type = ? AND key = ?${lastSort ? ` AND sort ${direction === 'asc' ? '>' : '<'} ?` : ''} LIMIT ${limit}`,
      lastSort ? [`${ref}`, type, sort, lastSort] : [`${ref}`, type, sort]
    );

    // get data
    return (await Promise.all(data.rows.map((row) => {
      // return constructor
      return this.findById(row.model_id);
    }))).filter((r) => r);
  }

  /**
   * to json
   */
  async toJSON(): Promise<Object> {
    // Load namespace and subspace
    const type = Reflect.getMetadata('model:type', this.constructor);

    // get data
    const data = this.__data;

    // keys
    return {
      type,

      ...data,
    };
  }
  
  /*
   * create normal query
   */
  static async query(query, data, includeLog = true) {
    // query
    if (includeLog) logger.info(`executing ${query}`);

    // get result
    const result = await client.execute(query, data);

    // resolve
    return result;
  }

  /*
   * create batch of insert/delete queries
   */
  static async batch(queries) {
    // query
    logger.info(`batch ${queries.map((q) => q.query).join(', ')}`);

    // chunks
    const arrChunks = chunks(queries, 30);

    // promise all
    return await Promise.all(arrChunks.map((chunk) => {
      // chunked query
      return client.batch(chunk, {
        logged  : false,
        prepare : true,
      });
    }));
  }
}