import 'reflect-metadata';

// Import aliases
import _ from 'lodash';
import equal from 'deep-equal';
import mquery from 'mquery';
import Events from 'events';
import dotProp from 'dot-prop';
import pluralize from 'pluralize';
import { customAlphabet } from 'nanoid';

// create alphabet
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 40);

// globals
let database, client, pubsub, logger;

/**
 * Exports decorator function to set type of model
 */
export function Type(type: string) {
  // return function
  return (target: any) => {
    // Add namespace and subspace
    Reflect.defineMetadata('model:type', type, target);
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

    // fix cammel case
    this.__data.createdAt = this.__data.createdAt || this.__data.created_at || new Date();
    this.__data.updatedAt = this.__data.updatedAt || this.__data.updated_at || new Date();

    // delete
    delete this.__data._id;
    delete this.__data.created_at;
    delete this.__data.updated_at;
  }

  /**
   * build
   *
   * @param base 
   */
  static build(actualBase) {
    // set globals
    pubsub = actualBase.pubsub;
    logger = actualBase.logger;
    client = actualBase.client;
    database = actualBase.database;
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
   * get pubsub
   */
  static get database () {
    // get pubsub
    return database;
  }

  /**
   * get collection
   */
  static get collection () {
    // Load namespace and subspace
    const type = Reflect.getMetadata('model:type', this);

    // check type
    if (!type) return null;

    // return collection
    return mquery(database.collection(pluralize(type)));
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

    // set create
    const creating = !this.__data.id || !this.__data.createdAt;

    // check id
    if (!this.__data.id) this.__data.id = `${nanoid()}`;

    // no need to save if nothing has changed
    if (!force && !creating && !this.__changed) return;

    // set id if not exists
    if (!this.__data.createdAt) this.__data.createdAt = new Date();

    // check created/updated
    this.__data.updatedAt = new Date();

    // save model
    const result = await this.constructor.collection.findOneAndUpdate({
      id : this.__data.id,
    }, this.__data, {
      upsert : true,
    });

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
    return result;
  }

  /**
   * Removes the model
   */
  async remove(noEmission = null) {
    // Load namespace and subspace
    const type = Reflect.getMetadata('model:type', this.constructor);

    // save model
    await this.constructor.collection.findOneAndRemove({
      id : this.__data.id,
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
    // check id
    if (!id) return null;

    // find one
    const one = await this.collection.findOne({
      id,
    });

    // check one
    if (!one) return null;

    // return new
    return new this(one);
  }

  /**
   * find by ids
   *
   * @param ids 
   */
  static async findByIds(ids: Array<string>): Promise<any> {
    // check id
    if (!ids?.length) return [];

    // find one
    const many = await this.collection.where('id').in(ids).find();

    // check one
    if (!many?.length) return [];

    // return many
    return many.map((m) => new this(m));
  }

  /**
   * find by id
   *
   * @param id
   */
  static countByRef(ref: string): Promise<number> {
    // return count by refs
    return this.countByRefs([ref]);
  }

  /**
   * find by id
   *
   * @param id
   */
  static findByRef(ref: string, limit: number = 25, sort: string = 'createdAt', direction: 'asc' | 'desc' = 'desc', page: number | null = 0): Promise<Array<any>> {
    // find by refs
    return this.findByRefs([ref], limit, sort, direction, page);
  }

  /**
   * find by id
   *
   * @param id
   */
  static async countByRefs(refs: Array<string>): Promise<number> {
    // return count
    return this.collection.where('refs').in(refs).count();
  }

  /**
   * find by id
   *
   * @param id
   */
  static async findByRefs(refs: Array<string>, limit: number = 25, sort: string = 'createdAt', direction: 'asc' | 'desc' = 'desc', page: number | null = 0): Promise<Array<any>> {
    // return count
    let q = this.collection.where('refs').in(refs);

    // if sort
    if (sort) {
      // sort
      q = q.sort({
        [sort] : direction === 'desc' ? -1 : 1,
      });
    }

    // limit
    q = q.limit(limit);

    // if page
    if (page) {
      // skip
      q = q.skip(page * limit);
    }

    // find one
    const many = await q.find();

    // check one
    if (!many?.length) return [];

    // return many
    return many.map((m) => new this(m));
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
}