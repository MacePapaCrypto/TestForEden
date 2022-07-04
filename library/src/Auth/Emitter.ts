
// import event emitter
import { EventEmitter } from 'events';

/**
 * create moon auth emitter class
 */
export default class MoonAuthEmitter extends EventEmitter {
  // cache timeout
  private login     = () => {};
  private logout    = () => {};
  private socket    = null;
  private library   = null;
  private current   = {};
  private challenge = (nonce, account) => ({ message : '', signature : '' });

  // getter/setter
  private __user    = null;
  private __account = null;
  private __updated = null;

  /**
   * constructor
   *
   * @param props 
   */
  constructor(props = {}) {
    // run super
    super();

    // bind
    this.props = this.props.bind(this);

    // set props
    this.props(props);
  }

  /**
   * set props
   *
   * @param props 
   */
  props(props = {}) {
    // set cache timeout
    this.login     = props.login     || this.login;
    this.logout    = props.logout    || this.logout;
    this.socket    = props.socket    || this.socket;
    this.library   = props.library   || this.library;
    this.account   = props.account   || this.account;
    this.challenge = props.challenge || this.challenge;

    // set current
    this.current = props;
  }

  
  ////////////////////////////////////////////////////////////////////////
  //
  // GETTER/SETTER
  //
  ////////////////////////////////////////////////////////////////////////

  /**
   * get state
   */
  public get state() {
    // return state
    return {
      user    : this.user,
      account : this.user && this.account,
      loading : this.loading,
  
      login  : this.login,
      logout : this.logout,
    };
  }

  /**
   * get account
   */
  get updated() {
    // return got
    return this.__updated;
  }

  /**
   * set account
   */
  set updated(updated) {
    // check date
    const shouldUpdate = updated !== this.__updated;

    // set updated
    this.__updated = updated;

    // check id
    if (shouldUpdate) {
      // emit
      this.emit('account', this.__updated);
    }
  }

  /**
   * get account
   */
  get account() {
    // return got
    return this.__account;
  }

  /**
   * set account
   */
  set account(account) {
    // check date
    const shouldUpdate = account !== this.__account;

    // set updated
    this.__account = account;

    // check id
    if (shouldUpdate) {
      // emit
      this.emit('account', this.__account);

      // authenticate account
      this.loadUser();
    }
  }

  /**
   * get user
   */
  get user() {
    // return got
    return this.__user;
  }

  /**
   * set user
   */
  set user(user) {
    // check date
    const shouldUpdate = user?.id !== this.__user?.id;

    // set updated
    this.__user = user;

    // check id
    if (shouldUpdate) {
      // emit
      this.emit('user', this.__user);

      // auth backend on restart
      this.socket.off('user', this.emitUser);
      this.socket.off('connect', this.loadUser);

      // check user
      if (user) {
        // auth backend on restart
        this.socket.on('user', this.emitUser);
        this.socket.on('connect', this.loadUser);
      }
    }
  }

  
  ////////////////////////////////////////////////////////////////////////
  //
  // AUTH FUNCTIONALITY
  //
  ////////////////////////////////////////////////////////////////////////

  /**
   * emit user
   *
   * @param user 
   */
  emitUser(user) {
    // check user
    if (user.id === user.id) {
      // update
      Object.keys(user).forEach((key) => {
        user[key] = user[key];
      });

      // update
      this.updated = new Date();
    }
  }

  /**
   * auth backend
   *
   * @returns 
   */
  async loadUser() {
    // check account
    if (!this.account) return;

    // try/catch
    try {
      // set loading
      this.user    = null;
      this.loading = true;

      // auth backend
      const authReq = await this.socket.get(`/auth/${this.account}`);

      // check authenticated
      if (`${this.account}`.toLowerCase() === `${authReq.id}`.toLowerCase()) {
        // set user
        this.user    = authReq;
        this.loading = false;

        // return
        return;
      }

      // challenge
      const { message, signature } = await this.challenge(authReq.nonce, this.account);

      // auth
      const result = await this.socket.post(`/auth/${this.account}`, {
        message,
        signature,
      });
  
      // set loading
      if (result) {
        // user
        this.user = result;
      } else {
        // logout
        this.logout();
      }
      
      // done loading
      this.loading = false;
  
      // return result
      return result;
    } catch (e) {
      console.log('test', e);
      // logout
      this.logout();
    }
  }
}