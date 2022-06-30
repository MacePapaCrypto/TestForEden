// import
import path from 'path';
import { ipcMain, BrowserWindow } from 'electron';

/**
 * window provider
 */
export default class TaskController {
  // variables
  public store   = null;
  public tasks   = new Map();
  public windows = null;

  /**
   * construct task controller
   *
   * @param store 
   */
  constructor(store, windows) {
    // set store
    this.store   = store;
    this.windows = windows;

    // sender send
    global.desktopEmitter = this.store;

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
      // send global
      event.sender.send('task', this.tasks.get(event.sender.id));
      event.sender.send('global', 'desktopEmitter');
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
          nodeIntegration    : true,
          contextIsolation   : false,
          enableRemoteModule : true,
        }
      }));

      // ready to show
      this.windows.get(task.id).once('ready-to-show', () => {
        // show window
        this.windows.get(task.id).show();
      });

      // load html
      this.windows.get(task.id).loadFile(`${path.dirname(global.appRoot)}/app.html`);

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

    // set to tasks
    this.tasks.set(this.windows.get(task.id).id, task);

    // update position
    this.windows.get(task.id).setPosition(parseInt(task.position.x), parseInt(task.position.y), true);
  }
}