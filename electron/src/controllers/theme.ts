// import
import { ipcMain } from 'electron';

/**
 * window provider
 */
export default class ThemeController {
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
    global.themeEmitter = this.store;

    // on desktop ipc
    ipcMain.on('build', (event) => {
      // sender send
      event.sender.send('global', 'themeEmitter');
    });
  }
}