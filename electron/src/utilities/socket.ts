
// socketio client
import socketio from 'socket.io-client';

// socket context
export default class MoonSocket {
  private ssid = null;
  private moon = null;
  private cache = {};
  private socket = null;
  private prefix = `/api/v1`;

  /**
   * construct moon socket
   *
   * @param main
   */
  constructor(main) {
    // set ssid
    this.moon = main;
  
    // socket opts
    const socketOpts = {
      path  : '/nft',
      query : {
        ssid : this.session,
      },
      reconnect  : true,
      transports : ['websocket'],
    };

    // connect
    this.socket = socketio.connect('wss://nft.edenup.com', socketOpts);
  }

  /**
   * get session id
   */
  public get session() {
    // set ssid
    if (this.ssid) return this.ssid;
    
    // get ssid
    let ssid = this.moon.store.get('ssid');

    // check ssid
    if (!ssid) {
      // ssid
      ssid = this.moon.getId();
      this.moon.store.set('ssid', ssid);
    }
    
    // set ssid
    this.ssid = ssid;

    // return
    return ssid;
  }

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
    const id = this.moon.getId(5);

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