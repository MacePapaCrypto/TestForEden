// import
import { shell, ipcMain } from 'electron';

// local
import electronStore from '../utilities/store';
import emitterUtility from '../utilities/emitter';

/**
 * window provider
 */
export default class AuthController {
  // variables
  public store   = null;
  public windows = new Map();

  /**
   * construct task controller
   *
   * @param store 
   */
  constructor(store) {
    // set store
    this.store = store;

    // add listener
    this.store.on('user', console.log);
    this.store.on('account', (newAccount) => {
      // set account
      electronStore.set('acid', newAccount);
    });

    // props
    this.store.props({
      login     : this.loginAction,
      logout    : this.logoutAction,
      challenge : this.challengeAction,
    });

    // on desktop ipc
    ipcMain.on('build', (event) => {
      // sender send
      emitterUtility.bind('authEmitter', this.store, event.sender);
    });

    // on callback
    ipcMain.on('authEmitter:callback', async (event, key, id, args) => {
      // try/catch
      try {
        // log
        const result = await this.store.state[key](...args);

        // resolve
        event.sender.send(id, { result });
      } catch (error) {
        // resolve
        event.sender.send(id, { error });
      }
    });
  }

  /**
   * login action
   */
  loginAction() {
    // open
    shell.openExternal('https://nft.edenup.com/app/login');

    // await login
    console.log('login');
  }

  /**
   * logout action
   */
  logoutAction() {
    // await login
    console.log('logout');
  }

  /**
   * challenge action
   */
  challengeAction() {
    // open
    shell.openExternal('https://nft.edenup.com/app/challenge');

    // await login
    console.log('challenge');
  }
}