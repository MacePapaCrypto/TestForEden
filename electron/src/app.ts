
// app root
global.appRoot = __dirname;

// renderer
import { ipcRenderer } from 'electron';
import { customAlphabet } from 'nanoid';

// create alphabet
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

/**
 * create moon electron class
 */
class MoonApp {
  // variables
  public auth = null;
  public socket = null;
  public desktop = null;

  /**
   * construct moon electron
   */
  constructor() {
    // run
    this.building = this.build();

    // bind
    this.buildEmitter = this.buildEmitter.bind(this);
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
    
    // send build request
    ipcRenderer.on('emitter', (e, data) => this.buildEmitter(data));

    // emit build
    ipcRenderer.send('build');
  }

  /**
   * build emitter
   *
   * @param param0 
   */
  buildEmitter({ name, data }) {
    // set global
    if (!window[name]) window[name] = {};

    // loop data
    Object.keys(data).forEach((key) => {
      // check type
      if (data[key] === 'ipc:callback') {
        // create callback
        window[name][key] = (...args) => {
          // create id
          const id = nanoid();

          // return promise
          return new Promise((resolve, reject) => {
            // create callback
            ipcRenderer.once(id, (e, data) => {
              // data
              if (data.error) {
                // error
                reject(data.error);
              } else {
                // result
                resolve(data.result);
              }
            });

            // send
            ipcRenderer.send(`${name}:callback`, key, id, args);
          });
        };
      } else {
        // set key value
        window[name][key] = data[key];
      }
    });
  }
}

// exporting
const exporting = new MoonApp();

// export default
export default exporting;