
// import
import SocketEmitter from '@moonup/ui/src/Socket/Emitter';
import DesktopEmitter from '@moonup/ui/src/Desktop/Emitter';
import { customAlphabet } from 'nanoid';
import { app, BrowserWindow } from 'electron';

// create alphabet
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 40);

// local
import store from './utilities/store';
import windowProvider from './providers/window';

/**
 * create moon electron class
 */
class MoonElectron {
  // variables
  public socket = null;
  public desktop = null;

  /**
   * construct moon electron
   */
  constructor() {
    // create id
    this.store = store;

    // run
    this.building = this.build();
  }

  
  ////////////////////////////////////////////////////////////////////////
  //
  // BUILD METHODS
  //
  ////////////////////////////////////////////////////////////////////////

  /**
   * build moon electron
   */
  async build() {
    // build socket
    await this.buildSocket();
    await this.buildDesktop();
  }

  /**
   * build socket connection
   */
  async buildSocket() {
    // building desktop
    console.log('BUILDING SOCKET');

    // ssid
    const ssid = store.get('ssid') || nanoid();

    // set
    store.set('ssid', ssid);

    // create new socket
    this.socket = new SocketEmitter({
      ssid,
    });
  }

  /**
   * build socket connection
   */
  async buildDesktop() {
    // building desktop
    console.log('BUILDING DESKTOP');

    // create new socket
    this.desktop = new DesktopEmitter({
      auth : {
        account : '0x9d4150274f0a67985A53513767EBf5988cEf45A4',
      },
      socket : this.socket,
    });

    // on updated
    this.desktop.on('updated', () => {
      // create windows
      windowProvider.setTasks(this.desktop.state.tasks);
    });
  }

  
  ////////////////////////////////////////////////////////////////////////
  //
  // WINDOW METHODS
  //
  ////////////////////////////////////////////////////////////////////////

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