// import
import { ipcMain } from 'electron';

// local
import emitterUtility from '../utilities/emitter';

/**
 * window provider
 */
export default class SocketController {
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

    // on desktop ipc
    ipcMain.on('build', (event) => {
      // sender send
      emitterUtility.bind('socketEmitter', this.store, event.sender);
    });

    // on callback
    ipcMain.on('socketEmitter:callback', async (event, key, id, args) => {
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
}