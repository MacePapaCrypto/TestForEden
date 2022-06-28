
// import
import useId from '@moonup/ui/src/useId';
import { app, BrowserWindow } from 'electron';

// local
import store from './utilities/store';
import Socket from './utilities/socket';

/**
 * create moon electron class
 */
class MoonElectron {
  /**
   * construct moon electron
   */
  constructor() {
    // create id
    this.store = store;
    this.getId = useId();

    // run
    this.building = this.build();
  }

  /**
   * build moon electron
   */
  async build() {
    // build socket
    await this.socket();
  }

  /**
   * build socket connection
   */
  async socket() {
    // create new socket
    this.socket = new Socket(this);
  }

  /**
   * runs moon electron
   */
  async run() {
    // await app ready
    await app.whenReady();

    // on all closed
    app.on('window-all-closed', () => {
      // quit app
      if (process.platform !== 'darwin') app.quit();
    });

    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width  : 800,
      height : 600,
  
      webPreferences : {
        nodeIntegration  : true,
        contextIsolation : false,
      },
    });
  
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
  
    // and load the index.html of the app.
    mainWindow.loadFile(`${__dirname}/index.html`)
  }
}

// exporting
const exporting = new MoonElectron();

// export default
export default exporting;