
// app root
global.appRoot = __dirname;

// renderer
import React from 'react';
import { createRoot } from 'react-dom/client';
import { customAlphabet } from 'nanoid';
import { remote, ipcRenderer } from 'electron';

// import main
import Main from './app/main';

// create alphabet
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

/**
 * create moon electron class
 */
class MoonApp {
  // variables
  public auth = null;
  public task = null;
  public socket = null;
  public updater = null;
  public desktop = null;

  /**
   * construct moon electron
   */
  constructor() {
    // run
    this.building = this.build();

    // bind
    this.onUpdater = this.onUpdater.bind(this);
    this.buildTask = this.buildTask.bind(this);
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
    ipcRenderer.on('task', (e, data) => this.buildTask(data));
    ipcRenderer.on('global', (e, id) => this.buildGlobal(id));

    // emit build
    ipcRenderer.send('build');

    // render
    this.buildReact();
  }

  /**
   * build task
   *
   * @param task 
   */
  buildTask(task) {
    // task
    this.task = task;

    // updater
    if (this.updater) {
      // set task to updater
      this.updater(this.task);
    }
  }

  /**
   * build global
   *
   * @param id 
   */
  buildGlobal(id) {
    // get global
    if (!window[id]) window[id] = remote.getGlobal(id);

    // render
    this.buildReact();
  }

  /**
   * build react
   */
  buildReact() {
    // check emitters exist
    if (['desktopEmitter', 'socketEmitter', 'authEmitter'].find((key) => !window[key])) return;

    // check app
    if (window.reactApp) return;

    // render
    window.reactApp = createRoot(document.getElementById('app'));
    window.reactApp.render(<Main task={ this.task } updater={ this.onUpdater } />);
  }

  /**
   * do updater
   *
   * @param updater 
   */
  onUpdater(updater) {
    // updater
    this.updater = updater;
  }
}

// exporting
const exporting = new MoonApp();

// export default
export default exporting;