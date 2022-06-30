// import
import { ipcMain } from 'electron';

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

    // sender send
    global.socketEmitter = this.store;

    // on desktop ipc
    ipcMain.on('build', (event) => {
      // sender send
      event.sender.send('global', 'socketEmitter');
    });
  }
}