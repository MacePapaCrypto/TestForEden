
// import
import path from 'path';
import { app, BrowserWindow } from 'electron';

/**
 * create moon electron class
 */
class MoonElectron {
  /**
   * construct moon electron
   */
  constructor() {

    // run
    this.run();
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