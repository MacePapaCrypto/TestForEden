import 'reflect-metadata';

// Import aliases
import _ from 'lodash';
import JSON5 from 'json5';
import Events from 'events';
import { v1 as uuid } from 'uuid';

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
  /**
   * construct
   *
   * @param args
   */
  constructor(...args) {
    // run super
    super(...args);
    
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
    this.__data.createdAt = this.__data.createdAt || this.__data.created_at;
    this.__data.updatedAt = this.__data.updatedAt || this.__data.updated_at;

    // delete
    delete this.__data.data;
    delete this.__data.created_at;
    delete this.__data.updated_at;

    // check refs/subjects
    if (!this.__data.refs) this.__data.refs = [];
  }

  /**
   * Saves the current model
   */
  public async save(emitter = null): Promise<any> {
    // Load namespace and subspace
    const type = Reflect.getMetadata('model:type', this.constructor);

    // create promises array
    const queries = [];

    // set create
    const creating = !!this.__data.id || !!this.__data.createdAt;

    // set id if not exists
    if (!this.__data.id) {
      this.__data.id = uuid();
      this.__data.createdAt = new Date();
    }

    // check created/updated
    this.__data.updatedAt = new Date();

    // keys
    const keys = ['id', 'type', 'data', 'refs', 'version', 'created_at', 'updated_at'];

    // create query
    const query = `INSERT INTO models (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;

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
      if (['refs'].includes(key) && !Array.isArray(this.__data[key])) return [];

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
    ['ref'].forEach((refType) => {
      // loop refs
      (this.__data[`${refType}s`] || []).forEach((ref) => {
        // push actual refs
        actualRefs.push(`${refType}:${ref}`);

        // add ref
        ['refs_desc', 'refs_asc', 'refs_by_model'].forEach((key) => {
          // add queries
          queries.push({
            query  : `INSERT INTO ${key} (ref, type, model_id) VALUES (?, ?, ?)`,
            params : [`${refType}:${ref}`, type, this.__data.id],
          });
        });
      });
    });

    // remove old refs
    existingRefs.filter((ref) => {
      // check includes
      return !actualRefs.includes(ref.ref);
    }).forEach(({ ref }) => {
      // delete from
      ['refs_desc', 'refs_asc', 'refs_by_model'].forEach((key) => {
        // add queries
        queries.push({
          query  : `DELETE FROM ${key} where ref = ? AND type = ? and model_id = ?`,
          params : [ref, type, this.__data.id],
        });
      });
    });

    // await actual query
    // @todo

    // chainable
    return this;
  }

  /**
   * Removes the model
   */
  async remove(emitter = null) {
    // Load namespace and subspace
    const type = Reflect.getMetadata('model:type', this.constructor);

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
    refs.forEach(({ ref }) => {
      // delete from
      ['refs_desc', 'refs_asc', 'refs_by_model'].forEach((key) => {
        // add queries
        queries.push({
          query  : `DELETE FROM ${key} where ref = ? AND type = ? and model_id = ?`,
          params : [ref, type, this.__data.id],
        });
      });
    });

    // await actual query
    // @todo
  }

  /**
   * get refs
   *
   * @returns 
   */
  async getRefs(): Promise<Array<any>> {
    // execute schema create
    const data = await Model.query('SELECT * FROM refs_by_model WHERE model_id = ?', [this.__data.id]);

    // get data
    return data.rows;
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
    
    // check id
    if (!id) return null;

    // execute schema create
    const data = await Model.query('SELECT * FROM models WHERE id = ?', [id]);

    // get data
    return data.rows[0] ? new this(data.rows[0]) : null;
  }

  /**
   * find by id
   *
   * @param id
   */
  static async findByRef(ref: string, limit: number = 25, sort: 'asc' | 'desc' = 'desc', lastId: string | null = null): Promise<Array<any>> {
    // Load namespace and subspace
    const type = Reflect.getMetadata('model:type', this);
    
    // check id
    if (!ref) return [];

    // execute schema create
    const data = await Model.query(`SELECT * FROM refs_${sort} WHERE ref = ? AND type = ?${lastId ? ` AND model_id ${sort === 'asc' ? '>' : '<'} ?` : ''} LIMIT ${limit}`,
      lastId ? [`ref:${ref}`, type, lastId] : [`ref:${ref}`, type]
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
}