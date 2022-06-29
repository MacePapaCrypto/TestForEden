
// emitter
import { EventEmitter } from 'events';

// debouncer
const timeouts = {};
const promises = {};

/**
 * desktop emitter class
 */
export default class DesktopEmitter extends EventEmitter {
  // public variables
  public tasks      = [];
  public desktops   = [];
  public shortcuts  = [];

  // getter/setter
  private __data = {
    loading    : null,
    updated    : new Date(),
    desktop    : null,
    activeTask : null,
  };

  // cache timeout
  private socket  = null;
  private timeout = 60 * 1000;
  private current = {};

  /**
   * constructor
   *
   * @param props 
   */
  constructor(props = {}) {
    // run super
    super();

    // set props
    this.props(props);

    // bind desktop methods
    this.getDesktop = this.getDesktop.bind(this);
    this.emitDesktop = this.emitDesktop.bind(this);
    this.listDesktops = this.listDesktops.bind(this);
    this.updateDesktop = this.updateDesktop.bind(this);
    this.createDesktop = this.createDesktop.bind(this);
    this.deleteDesktop = this.deleteDesktop.bind(this);
    this.emitDesktopRemove = this.emitDesktopRemove.bind(this);
  
    // shortcuts
    this.getShortcut = this.getShortcut.bind(this);
    this.emitShortcut = this.emitShortcut.bind(this);
    this.listShortcuts = this.listShortcuts.bind(this);
    this.updateShortcut = this.updateShortcut.bind(this);
    this.createShortcut = this.createShortcut.bind(this);
    this.deleteShortcut = this.deleteShortcut.bind(this);
    this.emitShortcutRemove = this.emitShortcutRemove.bind(this);

    // tasks
    this.getTask = this.getTask.bind(this);
    this.emitTask = this.emitTask.bind(this);
    this.loadTasks = this.loadTasks.bind(this);
    this.updateTask = this.updateTask.bind(this);
    this.createTask = this.createTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.updateTasks = this.updateTasks.bind(this);
    this.pushTaskPath = this.pushTaskPath.bind(this);
    this.emitTaskRemove = this.emitTaskRemove.bind(this);
    this.bringTaskToFront = this.bringTaskToFront.bind(this);
    this.findOrCreateTask = this.findOrCreateTask.bind(this);

    // groups
    this.createGroup = this.createGroup.bind(this);
    this.updateGroup = this.updateGroup.bind(this);
    this.removeGroup = this.removeGroup.bind(this);
  }

  /**
   * set props
   *
   * @param props 
   */
  props(props = {}) {
    // set cache timeout
    this.auth    = props.auth || this.auth;
    this.socket  = props.socket || this.socket;
    this.timeout = props.timeout || props.cache || this.timeout;

    // useEffect stuff
    if (props.auth?.account !== this.current.auth?.account) {
      // load from socket
      this.listDesktops();
  
      // on connect
      this.socket.socket.on('task', this.emitTask);
      this.socket.socket.on('desktop', this.emitDesktop);
      this.socket.socket.on('connect', this.listDesktops);
      this.socket.socket.on('shortcut', this.emitShortcut);
      this.socket.socket.on('task+remove', this.emitTaskRemove);
      this.socket.socket.on('desktop+remove', this.emitDesktopRemove);
      this.socket.socket.on('shortcut+remove', this.emitShortcutRemove);
  
      // done
      return () => {
        // off connect
        this.socket.socket.removeListener('task', this.emitTask);
        this.socket.socket.removeListener('desktop', this.emitDesktop);
        this.socket.socket.removeListener('connect', this.listDesktops);
        this.socket.socket.removeListener('shortcut', this.emitShortcut);
        this.socket.socket.removeListener('task+remove', this.emitTaskRemove);
        this.socket.socket.removeListener('desktop+remove', this.emitDesktopRemove);
        this.socket.socket.removeListener('shortcut+remove', this.emitShortcutRemove);
      };
    }
  }

  /**
   * get state
   */
  public get state() {
    // return state
    return {
      get    : this.getDesktop,
      list   : this.listDesktops,
      update : this.updateDesktop,
      create : this.createDesktop,
      delete : this.deleteDesktop,
  
      // shortcuts
      getShortcut : this.getShortcut,
      listShortcuts : this.listShortcuts,
      updateShortcut : this.updateShortcut,
      createShortcut : this.createShortcut,
      deleteShortcut : this.deleteShortcut,
  
      // shortcuts
      getTask : this.getTask,
      loadTasks : this.loadTasks,
      updateTask : this.updateTask,
      createTask : this.createTask,
      deleteTask : this.deleteTask,
      updateTasks : this.updateTasks,
      pushTaskPath : this.pushTaskPath,
      bringTaskToFront : this.bringTaskToFront,
      findOrCreateTask : this.findOrCreateTask,
  
      // group
      createGroup : this.createGroup,
      updateGroup : this.updateGroup,
      removeGroup : this.removeGroup,
  
      tasks : this.tasks,
      desktop : this.desktop,
      loading : this.loading,
      updated : this.updated,
      desktops : this.desktops,
      shortcuts : this.shortcuts,
      activeTask : this.activeTask,
    };
  }

  /**
   * get desktop
   */
  get desktop() {
    // return got
    return this.__data.desktop;
  }

  /**
   * set desktop
   */
  set desktop(id) {
    // should load
    const shouldLoad = id !== this.__data.desktop;

    // set desktop
    this.__data.desktop = id;

    // check id
    if (shouldLoad) {
      // load tasks
      this.loadTasks();
      this.listShortcuts();

      // emit
      this.emit('desktop', id);
    }
  }

  /**
   * get desktop
   */
  get updated() {
    // return got
    return this.__data.updated;
  }

  /**
   * set updated
   */
  set updated(updated) {
    // check date
    const shouldUpdate = updated !== this.__data.updated;

    // set updated
    this.__data.updated = updated;

    // check id
    if (shouldUpdate) {
      // emit
      this.emit('updated', this.__data.updated);
    }
  }

  /**
   * get desktop
   */
  get loading() {
    // return got
    return this.__data.loading;
  }

  /**
   * set updated
   */
  set loading(loading) {
    // check date
    const shouldUpdate = loading !== this.__data.loading;

    // set updated
    this.__data.loading = loading;

    // check id
    if (shouldUpdate) {
      // emit
      this.emit('loading', this.__data.loading);
    }
  }

  /**
   * get desktop
   */
  get activeTask() {
    // return got
    return this.__data.activeTask;
  }

  /**
   * set updated
   */
  set activeTask(activeTask) {
    // check date
    const shouldUpdate = activeTask !== this.__data.activeTask;

    // set updated
    this.__data.activeTask = activeTask;

    // check id
    if (shouldUpdate) {
      // emit
      this.emit('activeTask', this.__data.activeTask);
    }
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // MISC FUNCTIONALITY
  //
  ////////////////////////////////////////////////////////////////////////

  /**
   * debounce function
   *
   * @param key 
   * @param fn 
   * @param to 
   */
  debounce (key, fn, to = 500) {
    // clear
    clearTimeout(timeouts[key]);
  
    // get resolver
    let [promise, resolver] = promises[key] || [];
  
    // if no promise
    if (!promise || !resolver) {
      // create new promise
      promise = new Promise((resolve) => {
        resolver = resolve;
      });
  
      // set
      promises[key] = [promise, resolver];
    }
  
    // set timeout
    timeouts[key] = setTimeout(async () => {
      // execute debounce function
      const result = await fn();
  
      // resolve
      resolver(result);
  
      // delete
      delete promises[key];
    }, to);
  
    // return promise
    return promise;
  }


  ////////////////////////////////////////////////////////////////////////
  //
  // DESKTOP FUNCTIONALITY
  //
  ////////////////////////////////////////////////////////////////////////

  /**
   * get desktop
   *
   * @param id 
   * @returns 
   */
  async getDesktop(id) {
    // check found
    if (!id) return;

    // check found
    const found = this.desktops.find((s) => s.id === id);

    // check found
    if (found) return found;

    // load
    const backendDesktop = await this.socket.get(`/desktop/${id}`);

    // return backend desktop
    return backendDesktop;
  }

  /**
   * list desktops
   *
   * @returns 
   */
  async listDesktops() {
    // loading
    this.loading = 'desktops';

    // loaded
    let loadedDesktops = [];

    // try/catch
    try {
      // loaded
      loadedDesktops = await this.socket.get('/desktop/list');

      // desktops
      for (let i = (this.desktops.length - 1); i >= 0; i--) {
        // check if desktop
        if (!loadedDesktops.find((s) => s.id === this.desktops[i].id)) {
          // removed
          this.desktops.splice(i, 1);
        }
      }

      // replace all info
      loadedDesktops.forEach((desktop) => {
        // local
        const localDesktop = this.desktops.find((s) => s.id === desktop.id);

        // check local desktop
        if (!localDesktop) return this.desktops.push(desktop);

        // update info
        Object.keys(desktop).forEach((key) => {
          // desktop key
          localDesktop[key] = desktop[key];
        });
      });

      // set desktops
      this.updated = new Date();
    } catch (e) {
      // loading
      this.loading = null;
      throw e;
    }

    // set loading
    this.loading = null;

    // check desktops
    if (!this.desktop) {
      // sort and set default
      const defaultDesktop = loadedDesktops.sort((a, b) => {
        if (a.order > b.order) return 1;
        if (a.order < b.order) return -1;
        return 0;
      })[0];

      // set default
      this.desktop = defaultDesktop;
    }

    // return desktops
    return loadedDesktops;
  }

  /**
   * create desktop
   *
   * @param param0 
   * @returns 
   */
  async createDesktop({ type, order, }) {
    // set loading
    this.loading = 'create';

    // loaded
    let createdDesktop = {};

    // try/catch
    try {
      // load
      createdDesktop = await this.socket.post('/desktop', {
        type,
        order,

        account : auth?.account,
      }, this.timeout);

      // set desktops
      this.updateDesktop(createdDesktop, false);
    } catch (e) {
      // loading
      this.loading = null;
      throw e;
    }

    // done loading
    this.loading = null;

    // return desktops
    return createdDesktop;
  }

  /**
   * update desktop
   *
   * @param param0 
   * @param save 
   * @returns 
   */
  async updateDesktop({ id, type, order, parent }, save = true){
    // set loading
    if (save) {
      // loading
      this.loading = id;
    }

    // update desktop
    let localDesktop = this.desktops.find((s) => s.id === id);

    // check local desktop
    if (!localDesktop) {
      // set desktop
      localDesktop = {
        id,
        type,
      };

      // push
      this.desktops.push(localDesktop);
    }

    // keys
    if (typeof type !== 'undefined') localDesktop.type = type;
    if (typeof order !== 'undefined') localDesktop.order = order;
    if (typeof parent !== 'undefined') localDesktop.parent = parent;

    // update
    if (!save) {
      // update
      return this.updated = new Date();
    } else {
      // update in place
      this.updated = new Date();
    }

    // loaded
    let loadedDesktop = localDesktop;

    // try/catch
    try {
      // load
      loadedDesktop = await this.socket.patch(`/desktop/${id}`, {
        type,
        order,
        parent
      });

      // loop
      Object.keys(loadedDesktop).forEach((key) => {
        // add to loaded
        localDesktop[key] = loadedDesktop[key];
      });

      // set desktops
      this.updated = new Date();
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    this.loading = null;

    // return desktops
    return loadedDesktop;
  }

  /**
   * delete desktop
   *
   * @param param0 
   * @returns 
   */
  async deleteDesktop({ id }) {
    // set loading
    this.loading = id;

    // try/catch
    try {
      // load
      await this.socket.delete(`/desktop/${id}`);

      // desktops
      for (let i = (this.desktops.length - 1); i >= 0; i--) {
        // check if desktop
        if (id === this.desktops[i].id) {
          // removed
          this.desktops.splice(i, 1);
        }
      }

      // set desktops
      this.updated = new Date();
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    this.loading = null;

    // return desktops
    return true;
  }

  /**
   * emit desktop update
   *
   * @param desktop 
   * @param isRemove 
   */
  emitDesktop(desktop, isRemove = false) {
    // remove
    if (isRemove) {
      // desktops
      for (let i = (this.desktops.length - 1); i >= 0; i--) {
        // check if desktop
        if (desktop.id === this.desktops[i].id) {
          // removed
          this.desktops.splice(i, 1);
        }
      }

      // update
      this.updated = new Date();
    } else {
      // update
      this.updateDesktop(desktop, false);
    }
  }

  /**
   * emit desktop
   *
   * @param desktop 
   * @returns 
   */
  emitDesktopRemove(desktop) {
    // emit desktop
    return this.emitDesktop(desktop);
  }


  ////////////////////////////////////////////////////////////////////
  //
  //  SHORTCUTS
  //
  ////////////////////////////////////////////////////////////////////

  /**
   * get shortcut
   *
   * @param id 
   * @returns 
   */
  async getShortcut(id) {
    // check found
    if (!id) return;

    // check found
    const found = this.shortcuts.find((s) => s.id === id);

    // check found
    if (found) return found;

    // load
    const backendShortcut = await this.socket.get(`/shortcut/${id}`);

    // return backend shortcut
    return backendShortcut;
  }

  /**
   * list shortcuts
   *
   * @returns 
   */
  async listShortcuts() {
    // set loading
    this.loading = 'shortcuts';

    // loaded
    let loadedShortcuts = [];

    // try/catch
    try {
      // loaded
      loadedShortcuts = await this.socket.get('/shortcut/list', {
        desktop : this.desktop?.id,
      });

      // shortcuts
      for (let i = (this.shortcuts.length - 1); i >= 0; i--) {
        // check if shortcut
        if (!loadedShortcuts.find((s) => s.id === this.shortcuts[i].id)) {
          // removed
          this.shortcuts.splice(i, 1);
        }
      }

      // replace all info
      loadedShortcuts.forEach((shortcut) => {
        // local
        const localShortcut = this.shortcuts.find((s) => s.id === shortcut.id);

        // check local shortcut
        if (!localShortcut) return this.shortcuts.push(shortcut);

        // update info
        Object.keys(shortcut).forEach((key) => {
          // shortcut key
          localShortcut[key] = shortcut[key];
        });
      });

      // set shortcuts
      this.updated = new Date();
    } catch (e) {
      // loading
      this.loading = null;
      throw e;
    }

    // set loading
    this.loading = null;

    // return shortcuts
    return loadedShortcuts;
  }

  /**
   * create shortcut
   *
   * @param param0 
   * @returns 
   */
  async createShortcut({ app, path, order, }) {
    // set loading
    this.loading = 'create';

    // loaded
    let createdShortcut = {};

    // try/catch
    try {
      // load
      createdShortcut = await this.socket.post('/shortcut', {
        app,
        path,
        order,

        account : this.auth?.account,
        desktop : this.desktop?.id,
      }, this.timeout);

      // set shortcuts
      this.updateShortcut(createdShortcut, false);
    } catch (e) {
      // loading
      this.loading = null;
      throw e;
    }

    // done loading
    this.loading = null;

    // return shortcuts
    return createdShortcut;
  }

  /**
   * update shortcut
   *
   * @param param0 
   * @param save 
   * @returns 
   */
  async updateShortcut({ id, app, path, order, parent, }, save = true) {
    // set loading
    if (save) {
      // set loading
      this.loading = id;
    }

    // update shortcut
    let localShortcut = this.shortcuts.find((s) => s.id === id);

    // check local shortcut
    if (!localShortcut) {
      // set shortcut
      localShortcut = {
        id,
        app,
        path,
      };

      // push
      this.shortcuts.push(localShortcut);
    }

    // keys
    if (typeof app !== 'undefined') localShortcut.app = app;
    if (typeof path !== 'undefined') localShortcut.path = path;
    if (typeof order !== 'undefined') localShortcut.order = order;
    if (typeof parent !== 'undefined') localShortcut.parent = parent;

    // update
    if (!save) {
      // update
      return this.updated = new Date();
    } else {
      // update in place
      this.updated = new Date();
    }

    // loaded
    let loadedShortcut = localShortcut;

    // try/catch
    try {
      // load
      loadedShortcut = await this.socket.patch(`/shortcut/${id}`, {
        app,
        path,
        order,
        parent
      });

      // loop
      Object.keys(loadedShortcut).forEach((key) => {
        // add to loaded
        localShortcut[key] = loadedShortcut[key];
      });

      // set shortcuts
      this.updated = new Date();
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    this.updated = null;

    // return shortcuts
    return loadedShortcut;
  }

  /**
   * delete shortcut
   *
   * @param param0 
   * @returns 
   */
  async deleteShortcut({ id }) {
    // set loading
    this.loading = id;

    // try/catch
    try {
      // load
      await this.socket.delete(`/shortcut/${id}`);

      // shortcuts
      for (let i = (this.shortcuts.length - 1); i >= 0; i--) {
        // check if shortcut
        if (id === this.shortcuts[i].id) {
          // removed
          this.shortcuts.splice(i, 1);
        }
      }

      // set shortcuts
      this.updated = new Date();
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    this.loading = null;

    // return shortcuts
    return true;
  }

  /**
   * emit shortcut
   *
   * @param shortcut 
   * @param isRemove 
   */
  emitShortcut(shortcut, isRemove = false) {
    // remove
    if (isRemove) {
      // shortcuts
      for (let i = (this.shortcuts.length - 1); i >= 0; i--) {
        // check if shortcut
        if (shortcut.id === this.shortcuts[i].id) {
          // removed
          this.shortcuts.splice(i, 1);
        }
      }

      // update
      this.updated = new Date();
    } else {
      // update
      this.updateShortcut(shortcut, false);
    }
  }

  /**
   * emit shortcut remove
   *
   * @param shortcut 
   * @returns 
   */
  emitShortcutRemove(shortcut) {
    // emit shortcut
    return this.emitShortcut(shortcut, true);
  }


  ////////////////////////////////////////////////////////////////////
  //
  //  TASKS
  //
  ////////////////////////////////////////////////////////////////////

  /**
   * get task
   *
   * @param id 
   * @returns 
   */
  async getTask(id) {
    // check found
    if (!id) return;

    // check found
    const found = this.tasks.find((s) => s.id === id);

    // check found
    if (found) return found;

    // load
    const backendTask = await this.socket.get(`/task/${id}`);

    // return backend task
    return backendTask;
  }

  /**
   * load tasks
   *
   * @returns 
   */
  async loadTasks() {
    // set tasks
    if (!this.desktop?.id) return;

    // set loading
    this.loading = 'tasks';

    // loaded
    let loadedTasks = [];

    // try/catch
    try {
      // loaded
      loadedTasks = await this.socket.get('/task/list', {
        desktop : this.desktop?.id,
      });

      // tasks
      for (let i = (this.tasks.length - 1); i >= 0; i--) {
        // check if task
        if (!loadedTasks.find((s) => s.id === this.tasks[i].id)) {
          // removed
          this.tasks.splice(i, 1);
        }
      }

      // replace all info
      loadedTasks.forEach((task) => {
        // local
        const localTask = this.tasks.find((s) => s.id === task.id);

        // check local task
        if (!localTask) return this.tasks.push(task);

        // update info
        Object.keys(task).forEach((key) => {
          // task key
          localTask[key] = task[key];
        });
      });

      // sort and find
      const topTask = [...loadedTasks].sort((a, b) => {
        if (a.zIndex > b.zIndex) return -1;
        if (a.zIndex < b.zIndex) return 1;
        return 0;
      })[0];

      // set active
      if (topTask) this.activeTask = topTask.id;

      // set tasks
      this.updated = new Date();
    } catch (e) {
      // loading
      this.updated = null;
      throw e;
    }

    // set loading
    this.updated = null;

    // return tasks
    return loadedTasks;
  }

  /**
   * bring task to front
   *
   * @param task 
   * @returns 
   */
  bringTaskToFront(task) {
    // check loading
    if (this.loading === task.id) return;

    // check already active
    if (this.activeTask === task.id) return;

    // set active task
    this.activeTask = task.id;

    // get window
    const item = this.tasks.find((t) => t.id === task.id);

    // check item
    if (!item) return;

    // remove all
    item.zIndex = this.tasks.length + 1;

    // sort
    [...this.tasks].sort((a, b) => {
      // indexing
      if (a.zIndex > b.zIndex) return 1;
      if (a.zIndex < b.zIndex) return -1;
      return 0;
    }).forEach((item, i) => {
      // set z index
      item.zIndex = i + 1;
    });

    // update
    this.updateTasks();
  }

  /**
   * find or create task
   *
   * @param param0 
   * @returns 
   */
  async findOrCreateTask({ app, path, order }, exact = false) {
    // found
    const found = this.tasks.find((t) => t.app === app && (exact ? (t.path === path) : (t.path.startsWith(path))));

    // check exists
    if (found) {
      // done
      this.bringTaskToFront(found);
      return found;
    }

    // return await
    const newTask = await this.createTask({
      app,
      path,
      order,
    });
    this.bringTaskToFront(newTask);

    // return new task
    return newTask;
  }

  /**
   * create task
   *
   * @param param0 
   * @returns 
   */
  async createTask({ app, path, order }) {
    // set loading
    this.loading = 'create';

    // loaded
    let createdTask = {};

    // try/catch
    try {
      // load
      createdTask = await this.socket.post('/task', {
        app,
        path,

        order   : typeof order !== 'undefined' ? order : this.tasks.length,
        account : this.auth?.account,
        desktop : this.desktop?.id,
      }, this.timeout);

      // set tasks
      this.updateTask(createdTask, false);
    } catch (e) {
      // loading
      this.loading = null;
      throw e;
    }

    // done loading
    this.loading = null;

    // return tasks
    return createdTask;
  }

  /**
   * push task path
   *
   * @param param0 
   */
  async pushTaskPath({ id, path }) {
    // update task
    const currentPath = this.tasks.find((s) => s.id === id)?.path;

    // update task
    await this.updateTask({ id, path });

    // update task
    const localTask = this.tasks.find((s) => s.id === id);

    // push history
    if (localTask) {
      // check history
      if (!localTask.history) {
        localTask.history = [currentPath];
      }

      // push path
      localTask.history.push(path);

      // update
      this.updated = new Date();
    }
  }

  /**
   * update task
   *
   * @param updatingTask 
   * @param save 
   * @returns 
   */
  async updateTask(updatingTask, save = true) {
    // const
    const {
      id,
      app,
      path,
      order,
      parent,
      zIndex,
      position,
    } = updatingTask;

    // set loading
    if (save) this.loading = id;

    // update task
    let localTask = this.tasks.find((s) => s.id === id);

    // check local task
    if (!localTask) {
      // set task
      localTask = {
        ...updatingTask,
      };

      // push
      this.tasks.push(localTask);
    }

    // keys
    Object.keys(updatingTask).forEach((key) => {
      // check typeof
      if (typeof updatingTask[key] === 'undefined') return;

      // update task
      localTask[key] = updatingTask[key];
    });

    // update
    if (!save) {
      // update
      return this.updated = new Date();
    } else {
      // update in place
      this.updated = new Date();
    }

    // loaded
    let loadedTask = localTask;

    // try/catch
    try {
      // load
      loadedTask = await this.socket.patch(`/task/${id}`, {
        app,
        path,
        order,
        parent,
        zIndex,
        position
      });

      // loop
      Object.keys(loadedTask).forEach((key) => {
        // add to loaded
        localTask[key] = loadedTask[key];
      });

      // set tasks
      this.updated = new Date();
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    this.loading = null;

    // return tasks
    return loadedTask;
  }

  /**
   * updates tasks
   *
   * @param updates 
   * @param digestBackendUpdates 
   * @returns 
   */
  updateTasks(updates = tasks, digestBackendUpdates = false) {
    // check desktop
    if (!this.desktop?.id) return;

    // set spaces
    this.updated = new Date();

    // debounce
    return this.debounce('tasks', async () => {
      // loading
      this.loading = 'tasks';
  
      // loaded
      let loadedTasks = [];

      // try/catch
      try {
        // load
        loadedTasks = await this.socket.post(`/task/updates`, {
          updates,
          desktop : this.desktop.id,
        });

        // check digest backend
        if (digestBackendUpdates) {
          // replace all info
          loadedTasks.forEach((task) => {
            // local
            const localTask = this.tasks.find((s) => s.id === task.id);

            // check local space
            if (!localTask) return this.tasks.push(task);

            // update info
            Object.keys(task).forEach((key) => {
              // space key
              localTask[key] = task[key];
            });
          });

          // set spaces
          this.updated = new Date();
        }
      } catch (e) {
        // loading
        this.loading = null;
        throw e;
      }

      // done loading
      this.loading = null;

      // return loaded
      return loadedTasks;
    }, 500);
  }

  /**
   * delete task
   *
   * @param param0 
   * @returns 
   */
  async deleteTask({ id }) {
    // set loading
    this.loading = id;

    // try/catch
    try {
      // emit task
      this.emitTaskRemove({ id });

      // load
      await this.socket.delete(`/task/${id}`);
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    this.loading = null;

    // return tasks
    return true;
  }

  /**
   * emit task update
   *
   * @param task 
   * @param isRemove 
   */
  emitTask(task, isRemove = false) {
    // remove
    if (isRemove) {
      // tasks
      for (let i = (this.tasks.length - 1); i >= 0; i--) {
        // check if task
        if (task.id === this.tasks[i].id) {
          // removed
          this.tasks.splice(i, 1);
        }
      }

      // update
      this.updated = new Date();
    } else {
      // update
      this.updateTask(task, false);
    }
  }

  /**
   * emit task remove
   *
   * @param task 
   * @returns 
   */
  emitTaskRemove(task) {
    // emit task
    return this.emitTask(task, true);
  }


  ////////////////////////////////////////////////////////////////////
  //
  //  GROUPS
  //
  ////////////////////////////////////////////////////////////////////

  /**
   * create group
   *
   * @param param0 
   * @returns 
   */
  async createGroup({
    name        = null,
    type        = 'task',
    order       = 0,
    description = '',
  }) {
    // set loading
    this.loading = 'group';

    // loaded
    let createdGroup = {};

    // try/catch
    try {
      // load
      createdGroup = await this.socket.post(`/group/${type}`, {
        name,
        type,
        order,
        description,

        account : this.auth?.account,
        desktop : this.desktop?.id,
      }, this.timeout);

      // set desktops
      this.updateDesktop(createdGroup, false);
    } catch (e) {
      // loading
      this.loading = null;
      throw e;
    }

    // done loading
    this.loading = null;

    // return desktops
    return createdGroup;
  }

  /**
   * remove group
   *
   * @param param0 
   * @returns 
   */
  async removeGroup({
    id = null,
    
    type = 'task',
  }) {
    // set loading
    this.loading = 'group';

    // try/catch
    try {
      // load
      await this.socket.delete(`/group/${type}/${id}`);

      // desktops
      for (let i = (this.desktops.length - 1); i >= 0; i--) {
        // check if desktop
        if (this.desktops[i].id === id) {
          // removed
          this.desktops.splice(i, 1);
        }
      }

      // update desktops
      this.updated = new Date();
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    this.loading = null;

    // return desktops
    return true;
  }

  /**
   * update group
   *
   * @param param0 
   * @param save 
   * @returns 
   */
  async updateGroup({
    id,
    open,
    order,

    type = 'task',
  }, save = true) {
    // set loading
    if (save) this.loading = id;

    // update desktop
    let localGroup = this.desktops.find((s) => s.id === id);

    // check local desktop
    if (!localGroup) {
      // set desktop
      localGroup = {
        id,
        open,
        order,
      };

      // push
      this.desktops.push(localGroup);
    }

    // keys
    if (typeof open !== 'undefined') localGroup.open = open;
    if (typeof order !== 'undefined') localGroup.order = order;

    // update
    if (!save) {
      // update
      return this.updated = new Date();
    } else {
      // update in place
      this.updated = new Date();
    }

    // loaded
    let loadedGroup = localGroup;

    // try/catch
    try {
      // load
      loadedGroup = await this.socket.patch(`/group/${type}/${id}`, {
        open,
        order,
      });

      // loop
      Object.keys(loadedGroup).forEach((key) => {
        // add to loaded
        localGroup[key] = loadedGroup[key];
      });

      // set desktops
      this.updated = new Date();
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    this.updated = null;

    // return desktops
    return loadedGroup;
  }
}