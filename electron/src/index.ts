
// app root
global.appRoot = __dirname;

// import
import AuthEmitter from '@moonup/ui/src/Auth/Emitter';
import SocketEmitter from '@moonup/ui/src/Socket/Emitter';
import DesktopEmitter from '@moonup/ui/src/Desktop/Emitter';
import { customAlphabet } from 'nanoid';

// create alphabet
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 40);

// local
import store from './utilities/store';
import TaskController from './controllers/task';
import AuthController from './controllers/auth';
import SocketController from './controllers/socket';

/**
 * create moon electron class
 */
class MoonElectron {
  // variables
  public auth = null;
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
    await this.buildAuth();
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

    // socket controller
    const socketController = new SocketController(this.socket);
  }

  /**
   * build auth
   */
  async buildAuth() {
    // building desktop
    console.log('BUILDING AUTH');

    // ssid
    const acid = store.get('acid');

    // create new socket
    this.auth = new AuthEmitter({
      socket  : this.socket?.state,
      account : acid,
    });

    // create task controller
    const authController = new AuthController(this.auth);
  }

  /**
   * build socket connection
   */
  async buildDesktop() {
    // building desktop
    console.log('BUILDING DESKTOP');

    // create new socket
    this.desktop = new DesktopEmitter({
      auth   : this.auth?.state,
      socket : this.socket?.state,
    });

    // create task controller
    const taskController = new TaskController(this.desktop);
  }
}

// exporting
const exporting = new MoonElectron();

// export default
export default exporting;