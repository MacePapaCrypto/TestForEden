
// socketio client
import socketio from 'socket.io-client';
import { customAlphabet } from 'nanoid';

// create alphabet
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 40);

// socket context
export default class MoonSocketEmitter {
  // ssid
  private ssid = null;

  // cache timeout
  private cache   = {};
  private socket  = null;
  private prefix  = `/api/v1`;
  private options = {};

  /**
   * constructor
   *
   * @param props 
   */
  constructor(props = {}) {
    // bind
    this.props = this.props.bind(this);

    // bind event methods
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.emit = this.emit.bind(this);
    this.once = this.once.bind(this);

    // bind call methods
    this.get = this.get.bind(this);
    this.put = this.put.bind(this);
    this.post = this.post.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);

    // set props
    this.props(props);
  }

  /**
   * set props
   *
   * @param props 
   */
  props(props = {}) {
    // set ssid
    this.ssid = props.ssid || this.ssid;

    // check ssid
    if (!this.ssid) return;

    // socket opts
    this.options = {
      path  : '/nft',
      query : {
        ssid : this.ssid,
      },
      reconnect  : true,
      transports : ['websocket'],
    };

    // connect
    this.socket = this.socket || socketio.connect('wss://nft.edenup.com', this.options);
  }

  /**
   * get state
   */
  public get state() {
    // return state
    return {
      on : this.on,
      off : this.off,
      emit : this.emit,
      once : this.once,
      
      socket : this.socket,
  
      get : this.get,
      put : this.put,
      post : this.post,
      patch : this.patch,
      delete : this.delete,
    };
  }

  
  ////////////////////////////////////////////////////////////////////////
  //
  // CALL FUNCTIONALITY
  //
  ////////////////////////////////////////////////////////////////////////

  /**
   * call api method
   *
   * @param method 
   * @param path 
   * @param data 
   * @param cache 
   * @returns 
   */
  async call (method, path, data = {}, cache = true) {
    // check cache
    if (['patch', 'put', 'delete', 'post'].includes(method.toLowerCase())) cache = false;
    
    // check cache
    if (cache && this.cache[`${method}${path}${JSON.stringify(data)}`]) {
      // return await
      return this.cache[`${method}${path}${JSON.stringify(data)}`];
    } else {
      // delete cache
      delete this.cache[`${method}${path}${JSON.stringify(data)}`];
    }

    // get id
    const id = nanoid(5);

    // doing call
    console.log('DOING CALL', method, path, data, id);

    // create promise
    const result = new Promise((resolve, reject) => {
      // resolve
      this.socket.once(id, ({ success, result, message }) => {
        // check result
        if (success) return resolve(result);

        // reject
        reject(message);
      });
    });

    // check cache
    if (cache) {
      // add to call cache
      this.cache[`${method}${path}${JSON.stringify(data)}`] = result;

      // remove after timeout
      this.cache[`${method}${path}${JSON.stringify(data)}`].then(() => {
        // check if timed cache
        if (typeof cache === 'number') {
          // remove after timeout
          setTimeout(() => {
            // delete
            delete this.cache[`${method}${path}${JSON.stringify(data)}`];
          }, cache);
        } else {
          // delete
          delete this.cache[`${method}${path}${JSON.stringify(data)}`];
        }
      });
    }

    // emit
    this.socket.emit('call', id, method, path, data);

    // return result
    return result;
  }

  /**
   * on
   *
   * @param args 
   */
  on (...args) {
    // call to socket
    this.socket.on(...args);
  }

  /**
   * off
   *
   * @param args 
   */
  off (...args) {
    // call to socket
    this.socket.off(...args);
  }

  /**
   * emit
   *
   * @param args 
   */
  emit (...args) {
    // call to socket
    this.socket.emit(...args);
  }

  /**
   * once
   *
   * @param args 
   */
  once (...args) {
    // call to socket
    this.socket.once(...args);
  }

  /**
   * api get
   *
   * @param path 
   * @param data 
   * @returns 
   */
  get (path, data) {
    // return get
    return this.call('GET', `${this.prefix}${path}`, data);
  }

  /**
   * api put
   *
   * @param path 
   * @param data 
   * @returns 
   */
  put (path, data) {
    // return put
    return this.call('PUT', `${this.prefix}${path}`, data);
  }

  /**
   * api post
   *
   * @param path 
   * @param data 
   * @returns 
   */
  post (path, data) {
    // return post
    return this.call('POST', `${this.prefix}${path}`, data);
  }

  /**
   * api post
   *
   * @param path 
   * @param data 
   * @returns 
   */
  patch (path, data) {
    // return patch
    return this.call('PATCH', `${this.prefix}${path}`, data);
  }

  /**
   * api post
   *
   * @param path 
   * @param data 
   * @returns 
   */
  delete (path, data) {
    // return delete
    return this.call('DELETE', `${this.prefix}${path}`, data);
  }
}