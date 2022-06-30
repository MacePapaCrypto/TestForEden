// import
import { ipcMain, BrowserWindow } from 'electron';

// emitter utility
import emitterUtility from '../utilities/emitter';

/**
 * window provider
 */
export default class TaskController {
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

    // add listeners
    this.store.on('updated', () => {
      // create windows
      this.onTasks(this.store.state.tasks);
    });

    // on set title
    ipcMain.on('task:title', (event, title) => {
      // get web contents
      const webContents = event.sender;

      // get actual window
      const actualWindow = BrowserWindow.fromWebContents(webContents);

      // set title
      actualWindow.setTitle(title);
    });

    // on desktop ipc
    ipcMain.on('build', (event) => {
      // sender send
      emitterUtility.bind('desktopEmitter', this.store, event.sender);
    });

    // on callback
    ipcMain.on('desktopEmitter:callback', async (event, key, id, args) => {
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
   * set tasks
   *
   * @param tasks 
   */
  onTasks(tasks) {
    // loop tasks
    tasks.forEach((task) => this.runTask(task));
  }

  /**
   * update task
   *
   * @param task 
   */
  runTask(task) {
    // check window exists
    if (!this.windows.has(task.id)) {
      // create new window
      this.windows.set(task.id, new BrowserWindow({
        show   : false,
        title  : task.name,
        frame  : false,
        width  : parseInt((`${task.position.width || '100px'}`.replace('px', ''))),
        height : parseInt((`${task.position.height || '100px'}`.replace('px', ''))),


        webPreferences : {
          preload : `${global.appRoot}/../app.js`,
        },

        titleBarOverlay : false,
      }));

      // ready to show
      this.windows.get(task.id).once('ready-to-show', () => {
        // show window
        this.windows.get(task.id).show();
      });

      // load html
      this.windows.get(task.id).loadFile(`${global.appRoot}/app.html`);

      // set position
      this.windows.get(task.id).setPosition(parseInt(task.position.x), parseInt(task.position.y));

      // on move
      this.windows.get(task.id).on('moved', (e) => {
        // get bounds
        const bounds = this.windows.get(task.id).getBounds();

        // set bounds
        this.store.updateTask({
          id       : task.id,
          position : bounds,
        });
      });

      // on move
      this.windows.get(task.id).on('resized', (e) => {
        // get bounds
        const bounds = this.windows.get(task.id).getBounds();

        // set bounds
        this.store.updateTask({
          id       : task.id,
          position : bounds,
        });
      });
    }

    // update position
    this.windows.get(task.id).setPosition(parseInt(task.position.x), parseInt(task.position.y), true);
  }
}