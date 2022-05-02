// require dependencies
import redis from 'redis';
import { EventEmitter } from 'events';

/**
 * create pubsub class
 */
class NFTPubSub {
  private __prefix = 'nft';
  private __events = new EventEmitter();
  private __clients = {};

  /**
   * construct redis pubsub
   */
  constructor(connection) {
    // bind on/off methods
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.once = this.once.bind(this);
    this.emit = this.emit.bind(this);

    // bind lock methods
    this.lock = this.lock.bind(this);
    this.unlock = this.unlock.bind(this);

    // create conn
    const conn = {
      host     : connection.host,
      port     : connection.port,
      password : connection.password,
    };

    // create clients
    this.__clients = {
      pub  : redis.createClient(conn),
      sub  : redis.createClient(conn),
      lock : redis.createClient(conn),
    };

    // set events
    this.__events.setMaxListeners(0);

    // add listener
    this.__clients.sub.on('message', (channel, data) => {
      // get key
      const key = channel.split(`${this.__prefix}.`);

      // remove first
      key.shift();

      // emit event
      this.__events.emit(key.join(`${this.__prefix}.`), ...(JSON.parse(data)));
    });
  }

  // ////////////////////////////////////////////////////////////////////////////
  //
  // TIMEOUT METHOD
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * create timeout wrap
   *
   * @param {*} fn
   */
  timeout(fn) {
    // create timeout
    return new Promise((resolve) => {
      // timed
      let timed;

      /**
       * timeout or return
       */
      const timeoutOrReturn = (data) => {
        // check timed
        if (timed) return;

        // timeout and resolve
        timed = true;
        resolve(data);
      };

      // create timeout
      setTimeout(timeoutOrReturn, 500);

      // run without timeout and always resolve
      fn().then(timeoutOrReturn).catch(() => timeoutOrReturn()); // always resolve
    });
  }

  // ////////////////////////////////////////////////////////////////////////////
  //
  // ON/OFF METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * gets from redis cache
   *
   * @param  {String} key
   *
   * @return {*}
   */
  on(key, fn) {
    // on event
    this.__events.on(key, fn);

    // subscribe to event
    if (this.__events.listenerCount(key) === 1) {
      // subscribe to client
      this.__clients.sub.subscribe(`${this.__prefix}.${key}`);
    }
  }

  /**
   * gets from redis cache
   *
   * @param  {String} key
   *
   * @return {*}
   */
  off(key, fn) {
    // on event
    this.__events.removeListener(key, fn);

    // unsubscribe on no listeners left
    if (!this.__events.listenerCount(key)) {
      // subscribe to event
      this.__clients.sub.unsubscribe(`${this.__prefix}.${key}`);
    }
  }

  /**
   * once value
   *
   * @param  {String}   key
   * @param  {Function} fn
   *
   * @return {*}
   */
  once(key, fn) {
    // once
    const once = (...args) => {
      // do function once
      fn(...args);

      // remove listener
      this.off(key, once);
    };

    // on event
    this.on(key, once);
  }

  /**
   * emits to redis
   *
   * @param  {String} key
   *
   * @return {*}
   */
  emit(key, ...args) {
    // publish value
    this.__clients.pub.publish(`${this.__prefix}.${key}`, JSON.stringify(args));
  }

  // ////////////////////////////////////////////////////////////////////////////
  //
  // LOCK METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * create lock with timeout
   *
   * @param  {String}  key
   * @param  {Integer} timeout
   *
   * @return {Promise}
   */
  lock(key, timeout = 5000) {
    // get lock timeout
    const lockTimeout = (Date.now() + timeout + 1);

    // return lock promise
    return new Promise((resolve) => {
      // locking
      this.__clients.lock.set(`${this.__prefix}.lock.${key}`, lockTimeout, 'PX', timeout, 'NX', (err, result) => {
        // check error
        if (err || result === null) {
          return setTimeout(() => {
          // retry
            this.lock(key, timeout).then(resolve);
          }, 50);
        }

        // resolve
        resolve(() => {
          // return promise
          return new Promise((res) => {
            // delete
            this.__clients.lock.del(`${this.__prefix}.lock.${key}`, () => res());
          });
        });
      });
    });
  }

  /**
   * unlocks specific key
   *
   * @param  {String} key
   *
   * @return {*}
   */
  unlock(key) {
    // return promise
    return new Promise((res) => {
      // delete
      this.__clients.lock.del(`${this.__prefix}.lock.${key}`, () => res());
    });
  }
}

/**
 * create pubsub
 *
 * @type {NFTPubSub}
 */
export default NFTPubSub;
