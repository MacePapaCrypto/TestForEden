
// socketio client
import useAuth from '../useAuth';
import useSocket from '../useSocket';
import DesktopContext from './Context';
import React, { useCallback, useEffect, useState } from 'react';

// timeouts
const timeouts = {};
const promises = {};
const debounce = (key, fn, to = 500) => {
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
};

// socket context
const MoonDesktopProvider = (props = {}) => {
  // socket
  const auth = useAuth();
  const socket = useSocket();

  // state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(null);
  const [updated, setUpdated] = useState(new Date());
  const [desktops, setDesktops] = useState([]);
  const [shortcuts, setShortcuts] = useState([]);
  const [activeTask, setActiveTask] = useState(null);

  // navigated
  const [desktop, setDesktop] = useState(null);

  // cache timeout
  const cacheTimeout = props.timeout || props.cache || (60 * 1000);


  ////////////////////////////////////////////////////////////////////
  //
  //  DESKTOPS
  //
  ////////////////////////////////////////////////////////////////////

  // get desktop
  const getDesktop = useCallback(async (id) => {
    // check found
    if (!id) return;

    // check found
    const found = desktops.find((s) => s.id === id);

    // check found
    if (found) return found;

    // load
    const backendDesktop = await socket.get(`/desktop/${id}`);

    // return backend desktop
    return backendDesktop;
  }, [auth?.account, desktop?.id]);

  // list desktops
  const listDesktops = useCallback(async () => {
    // set loading
    setLoading('desktops');

    // loaded
    let loadedDesktops = [];

    // try/catch
    try {
      // loaded
      loadedDesktops = await socket.get('/desktop/list');

      // desktops
      for (let i = (desktops.length - 1); i >= 0; i--) {
        // check if desktop
        if (!loadedDesktops.find((s) => s.id === desktops[i].id)) {
          // removed
          desktops.splice(i, 1);
        }
      }

      // replace all info
      loadedDesktops.forEach((desktop) => {
        // local
        const localDesktop = desktops.find((s) => s.id === desktop.id);

        // check local desktop
        if (!localDesktop) return desktops.push(desktop);

        // update info
        Object.keys(desktop).forEach((key) => {
          // desktop key
          localDesktop[key] = desktop[key];
        });
      });

      // set desktops
      setUpdated(new Date());
    } catch (e) {
      // loading
      setLoading(null);
      throw e;
    }

    // set loading
    setLoading(null);

    // check desktops
    if (!desktop) {
      // sort and set default
      const defaultDesktop = loadedDesktops.sort((a, b) => {
        if (a.order > b.order) return 1;
        if (a.order < b.order) return -1;
        return 0;
      })[0];

      // set default
      setDesktop(defaultDesktop);
    }

    // return desktops
    return loadedDesktops;
  }, [auth?.account, desktop?.id]);

  // create
  const createDesktop = useCallback(async ({
    type,
    order,
  }) => {
    // set loading
    setLoading('create');

    // loaded
    let createdDesktop = {};

    // try/catch
    try {
      // load
      createdDesktop = await socket.post('/desktop', {
        type,
        order,

        account : auth?.account,
      }, cacheTimeout);

      // set desktops
      updateDesktop(createdDesktop, false);
    } catch (e) {
      // loading
      setLoading(null);
      throw e;
    }

    // done loading
    setLoading(null);

    // return desktops
    return createdDesktop;
  }, [auth?.account, desktop?.id]);

  // create
  const updateDesktop = useCallback(async ({
    id,
    type,
    order,
    parent,
  }, save = true) => {
    // set loading
    if (save) setLoading(id);

    // update desktop
    let localDesktop = desktops.find((s) => s.id === id);

    // check local desktop
    if (!localDesktop) {
      // set desktop
      localDesktop = {
        id,
        type,
      };

      // push
      desktops.push(localDesktop);
    }

    // keys
    if (typeof type !== 'undefined') localDesktop.type = type;
    if (typeof order !== 'undefined') localDesktop.order = order;
    if (typeof parent !== 'undefined') localDesktop.parent = parent;

    // update
    if (!save) {
      // update
      return setUpdated(new Date());
    } else {
      // update in place
      setUpdated(new Date());
    }

    // loaded
    let loadedDesktop = localDesktop;

    // try/catch
    try {
      // load
      loadedDesktop = await socket.patch(`/desktop/${id}`, {
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
      setUpdated(new Date());
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    setLoading(null);

    // return desktops
    return loadedDesktop;
  }, [auth?.account, desktop?.id]);

  // create
  const deleteDesktop = useCallback(async ({ id }) => {
    // set loading
    setLoading(id);

    // try/catch
    try {
      // load
      await socket.delete(`/desktop/${id}`);

      // desktops
      for (let i = (desktops.length - 1); i >= 0; i--) {
        // check if desktop
        if (id === desktops[i].id) {
          // removed
          desktops.splice(i, 1);
        }
      }

      // set desktops
      setUpdated(new Date());
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    setLoading(null);

    // return desktops
    return true;
  }, [auth?.account, desktop?.id]);

  // emit
  const emitDesktop = useCallback((desktop, isRemove = false) => {
    // remove
    if (isRemove) {
      // desktops
      for (let i = (desktops.length - 1); i >= 0; i--) {
        // check if desktop
        if (desktop.id === desktops[i].id) {
          // removed
          desktops.splice(i, 1);
        }
      }

      // update
      setUpdated(new Date());
    } else {
      // update
      updateDesktop(desktop, false);
    }
  }, [auth?.account, desktop?.id]);

  // emit desktop remove
  const emitDesktopRemove = (desktop) => emitDesktop(desktop, true);


  ////////////////////////////////////////////////////////////////////
  //
  //  SHORTCUTS
  //
  ////////////////////////////////////////////////////////////////////

  // get shortcut
  const getShortcut = useCallback(async (id) => {
    // check found
    if (!id) return;

    // check found
    const found = shortcuts.find((s) => s.id === id);

    // check found
    if (found) return found;

    // load
    const backendShortcut = await socket.get(`/shortcut/${id}`);

    // return backend shortcut
    return backendShortcut;
  }, [auth?.account, desktop?.id]);

  // load
  const listShortcuts = useCallback(async () => {
    // set loading
    setLoading('shortcuts');

    // loaded
    let loadedShortcuts = [];

    // try/catch
    try {
      // loaded
      loadedShortcuts = await socket.get('/shortcut/list', {
        desktop : desktop?.id,
      });

      // shortcuts
      for (let i = (shortcuts.length - 1); i >= 0; i--) {
        // check if shortcut
        if (!loadedShortcuts.find((s) => s.id === shortcuts[i].id)) {
          // removed
          shortcuts.splice(i, 1);
        }
      }

      // replace all info
      loadedShortcuts.forEach((shortcut) => {
        // local
        const localShortcut = shortcuts.find((s) => s.id === shortcut.id);

        // check local shortcut
        if (!localShortcut) return shortcuts.push(shortcut);

        // update info
        Object.keys(shortcut).forEach((key) => {
          // shortcut key
          localShortcut[key] = shortcut[key];
        });
      });

      // set shortcuts
      setUpdated(new Date());
    } catch (e) {
      // loading
      setLoading(null);
      throw e;
    }

    // set loading
    setLoading(null);

    // return shortcuts
    return loadedShortcuts;
  }, [auth?.account, desktop?.id]);

  // create
  const createShortcut = useCallback(async ({
    type,
    order,
  }) => {
    // set loading
    setLoading('create');

    // loaded
    let createdShortcut = {};

    // try/catch
    try {
      // load
      createdShortcut = await socket.post('/shortcut', {
        type,
        order,

        account : auth?.account,
        desktop : desktop?.id,
      }, cacheTimeout);

      // set shortcuts
      updateDesktop(createdShortcut, false);
    } catch (e) {
      // loading
      setLoading(null);
      throw e;
    }

    // done loading
    setLoading(null);

    // return shortcuts
    return createdShortcut;
  }, [auth?.account, desktop?.id]);

  // create
  const updateShortcut = useCallback(async ({
    id,
    type,
    order,
    parent,
  }, save = true) => {
    // set loading
    if (save) setLoading(id);

    // update shortcut
    let localShortcut = shortcuts.find((s) => s.id === id);

    // check local shortcut
    if (!localShortcut) {
      // set shortcut
      localShortcut = {
        id,
        type,
      };

      // push
      shortcuts.push(localShortcut);
    }

    // keys
    if (typeof type !== 'undefined') localShortcut.type = type;
    if (typeof order !== 'undefined') localShortcut.order = order;
    if (typeof parent !== 'undefined') localShortcut.parent = parent;

    // update
    if (!save) {
      // update
      return setUpdated(new Date());
    } else {
      // update in place
      setUpdated(new Date());
    }

    // loaded
    let loadedShortcut = localShortcut;

    // try/catch
    try {
      // load
      loadedShortcut = await socket.patch(`/shortcut/${id}`, {
        type,
        order,
        parent
      });

      // loop
      Object.keys(loadedShortcut).forEach((key) => {
        // add to loaded
        localShortcut[key] = loadedShortcut[key];
      });

      // set shortcuts
      setUpdated(new Date());
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    setLoading(null);

    // return shortcuts
    return loadedShortcut;
  }, [auth?.account, desktop?.id]);

  // create
  const deleteShortcut = useCallback(async ({ id }) => {
    // set loading
    setLoading(id);

    // try/catch
    try {
      // load
      await socket.delete(`/shortcut/${id}`);

      // shortcuts
      for (let i = (shortcuts.length - 1); i >= 0; i--) {
        // check if shortcut
        if (id === shortcuts[i].id) {
          // removed
          shortcuts.splice(i, 1);
        }
      }

      // set shortcuts
      setUpdated(new Date());
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    setLoading(null);

    // return shortcuts
    return true;
  }, [auth?.account, desktop?.id]);

  // emit
  const emitShortcut = useCallback((shortcut, isRemove = false) => {
    // remove
    if (isRemove) {
      // shortcuts
      for (let i = (shortcuts.length - 1); i >= 0; i--) {
        // check if shortcut
        if (shortcut.id === shortcuts[i].id) {
          // removed
          shortcuts.splice(i, 1);
        }
      }

      // update
      setUpdated(new Date());
    } else {
      // update
      updateShortcut(shortcut, false);
    }
  }, [auth?.account, desktop?.id]);

  // emit shortcut remove
  const emitShortcutRemove = (shortcut) => emitShortcut(shortcut, true);


  ////////////////////////////////////////////////////////////////////
  //
  //  TASKS
  //
  ////////////////////////////////////////////////////////////////////

  // get task
  const getTask = useCallback(async (id) => {
    // check found
    if (!id) return;

    // check found
    const found = tasks.find((s) => s.id === id);

    // check found
    if (found) return found;

    // load
    const backendTask = await socket.get(`/task/${id}`);

    // return backend task
    return backendTask;
  }, [auth?.account, desktop?.id]);

  // load
  const loadTasks = useCallback(async () => {
    // set tasks
    if (!desktop?.id) return;

    // set loading
    setLoading('tasks');

    // loaded
    let loadedTasks = [];

    // try/catch
    try {
      // loaded
      loadedTasks = await socket.get('/task/list', {
        desktop : desktop?.id,
      });

      // tasks
      for (let i = (tasks.length - 1); i >= 0; i--) {
        // check if task
        if (!loadedTasks.find((s) => s.id === tasks[i].id)) {
          // removed
          tasks.splice(i, 1);
        }
      }

      // replace all info
      loadedTasks.forEach((task) => {
        // local
        const localTask = tasks.find((s) => s.id === task.id);

        // check local task
        if (!localTask) return tasks.push(task);

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
      if (topTask) setActiveTask(topTask.id);

      // set tasks
      setUpdated(new Date());
    } catch (e) {
      // loading
      setLoading(null);
      throw e;
    }

    // set loading
    setLoading(null);

    // return tasks
    return loadedTasks;
  }, [auth?.account, desktop?.id]);

  // bring to front
  const bringTaskToFront = useCallback((task) => {
    // check loading
    if (loading === task.id) return;

    // check already active
    if (activeTask === task.id) return;

    // set active task
    setActiveTask(task.id);

    // get window
    const item = tasks.find((t) => t.id === task.id);

    // check item
    if (!item) return;

    // remove all
    item.zIndex = tasks.length + 1;

    // sort
    [...tasks].sort((a, b) => {
      // indexing
      if (a.zIndex > b.zIndex) return 1;
      if (a.zIndex < b.zIndex) return -1;
      return 0;
    }).forEach((item, i) => {
      // set z index
      item.zIndex = i + 1;
    });

    // update
    updateTasks();
  }, [loading, activeTask, auth?.account, desktop?.id]);

  /**
   * find or create task
   *
   * @param param0 
   * @returns 
   */
  const findOrCreateTask = useCallback(async ({
    type,
    path,
    order,
  }, exact = false) => {
    // found
    const found = tasks.find((t) => t.type === type && (exact ? (t.path === path) : (t.path.startsWith(path))));

    // check exists
    if (found) {
      // done
      bringTaskToFront(found);
      return found;
    }

    // return await
    const newTask = await createTask({
      type,
      path,
      order,
    });
    bringTaskToFront(newTask);

    // return new task
    return newTask;
  }, [auth?.account, desktop?.id]);

  // create
  const createTask = useCallback(async ({
    type,
    path,
    order,
  }) => {
    // set loading
    setLoading('create');

    // loaded
    let createdTask = {};

    // try/catch
    try {
      // load
      createdTask = await socket.post('/task', {
        type,
        path,

        order   : typeof order !== 'undefined' ? order : tasks.length,
        account : auth?.account,
        desktop : desktop?.id,
      }, cacheTimeout);

      // set tasks
      updateTask(createdTask, false);
    } catch (e) {
      // loading
      setLoading(null);
      throw e;
    }

    // done loading
    setLoading(null);

    // return tasks
    return createdTask;
  }, [auth?.account, desktop?.id]);

  // create
  const updateTask = useCallback(async (updatingTask, save = true) => {
    // const
    const {
      id,
      type,
      path,
      order,
      parent,
      zIndex,
      position,
    } = updatingTask;

    // set loading
    if (save) setLoading(id);

    // update task
    let localTask = tasks.find((s) => s.id === id);

    // check local task
    if (!localTask) {
      // set task
      localTask = {
        ...updatingTask,
      };

      // push
      tasks.push(localTask);
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
      return setUpdated(new Date());
    } else {
      // update in place
      setUpdated(new Date());
    }

    // loaded
    let loadedTask = localTask;

    // try/catch
    try {
      // load
      loadedTask = await socket.patch(`/task/${id}`, {
        type,
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
      setUpdated(new Date());
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    setLoading(null);

    // return tasks
    return loadedTask;
  }, [auth?.account, desktop?.id]);

  // update tsks
  const updateTasks = useCallback((updates = tasks, digestBackendUpdates = false) => {
    // check desktop
    if (!desktop?.id) return;

    // set spaces
    setUpdated(new Date());

    // debounce
    return debounce('tasks', async () => {
      // loading
      setLoading('tasks');
  
      // loaded
      let loadedTasks = [];

      // try/catch
      try {
        // load
        loadedTasks = await socket.post(`/task/updates`, {
          updates,
          desktop : desktop.id,
        });

        // check digest backend
        if (digestBackendUpdates) {
          // replace all info
          loadedTasks.forEach((task) => {
            // local
            const localTask = tasks.find((s) => s.id === task.id);

            // check local space
            if (!localTask) return tasks.push(task);

            // update info
            Object.keys(task).forEach((key) => {
              // space key
              localTask[key] = task[key];
            });
          });

          // set spaces
          setUpdated(new Date());
        }
      } catch (e) {
        // loading
        setLoading(null);
        throw e;
      }

      // done loading
      setLoading(null);

      // return loaded
      return loadedTasks;
    }, 500);
  }, [auth?.account, desktop?.id]);

  // create
  const deleteTask = useCallback(async ({ id }) => {
    // set loading
    setLoading(id);

    // try/catch
    try {
      // emit task
      emitTaskRemove({ id });

      // load
      await socket.delete(`/task/${id}`);
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    setLoading(null);

    // return tasks
    return true;
  }, [auth?.account, desktop?.id]);

  // emit
  const emitTask = useCallback((task, isRemove = false) => {
    // remove
    if (isRemove) {
      // tasks
      for (let i = (tasks.length - 1); i >= 0; i--) {
        // check if task
        if (task.id === tasks[i].id) {
          // removed
          tasks.splice(i, 1);
        }
      }

      // update
      setUpdated(new Date());
    } else {
      // update
      updateTask(task, false);
    }
  }, [auth?.account, desktop?.id]);

  // emit task remove
  const emitTaskRemove = (task) => emitTask(task, true);


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
  const createGroup = useCallback(async ({
    name        = null,
    type        = 'task',
    order       = 0,
    description = '',
  }) => {
    // set loading
    setLoading('group');

    // loaded
    let createdGroup = {};

    // try/catch
    try {
      // load
      createdGroup = await socket.post(`/group/${type}`, {
        name,
        type,
        order,
        description,

        account : auth?.account,
        desktop : desktop?.id,
      }, cacheTimeout);

      // set desktops
      updateDesktop(createdGroup, false);
    } catch (e) {
      // loading
      setLoading(null);
      throw e;
    }

    // done loading
    setLoading(null);

    // return desktops
    return createdGroup;
  }, [auth?.account, desktop?.id]);

  /**
   * create group
   *
   * @param param0 
   * @returns 
   */
  const removeGroup = useCallback(async ({
    id = null,
    
    type = 'task',
  }) => {
    // set loading
    setLoading('group');

    // try/catch
    try {
      // load
      await socket.delete(`/group/${type}/${id}`);

      // desktops
      for (let i = (desktops.length - 1); i >= 0; i--) {
        // check if desktop
        if (desktops[i].id === id) {
          // removed
          desktops.splice(i, 1);
        }
      }

      // update desktops
      setUpdated(new Date());
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    setLoading(null);

    // return desktops
    return true;
  }, [auth?.account, desktop?.id]);

  // create
  const updateGroup = useCallback(async ({
    id,
    open,
    order,

    type = 'task',
  }, save = true) => {
    // set loading
    if (save) setLoading(id);

    // update desktop
    let localGroup = desktops.find((s) => s.id === id);

    // check local desktop
    if (!localGroup) {
      // set desktop
      localGroup = {
        id,
        open,
        order,
      };

      // push
      desktops.push(localGroup);
    }

    // keys
    if (typeof open !== 'undefined') localGroup.open = open;
    if (typeof order !== 'undefined') localGroup.order = order;

    // update
    if (!save) {
      // update
      return setUpdated(new Date());
    } else {
      // update in place
      setUpdated(new Date());
    }

    // loaded
    let loadedGroup = localGroup;

    // try/catch
    try {
      // load
      loadedGroup = await socket.patch(`/group/${type}/${id}`, {
        open,
        order,
      });

      // loop
      Object.keys(loadedGroup).forEach((key) => {
        // add to loaded
        localGroup[key] = loadedGroup[key];
      });

      // set desktops
      setUpdated(new Date());
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    setLoading(null);

    // return desktops
    return loadedGroup;
  }, [auth?.account, desktop?.id]);
  
  // load from socket
  useEffect(() => {
    // load from socket
    listDesktops();

    // on connect
    socket.socket.on('task', emitTask);
    socket.socket.on('desktop', emitDesktop);
    socket.socket.on('connect', listDesktops);
    socket.socket.on('shortcut', emitShortcut);
    socket.socket.on('task+remove', emitTaskRemove);
    socket.socket.on('desktop+remove', emitDesktopRemove);
    socket.socket.on('shortcut+remove', emitShortcutRemove);

    // done
    return () => {
      // off connect
      socket.socket.removeListener('task', emitTask);
      socket.socket.removeListener('desktop', emitDesktop);
      socket.socket.removeListener('connect', listDesktops);
      socket.socket.removeListener('shortcut', emitShortcut);
      socket.socket.removeListener('task+remove', emitTaskRemove);
      socket.socket.removeListener('desktop+remove', emitDesktopRemove);
      socket.socket.removeListener('shortcut+remove', emitShortcutRemove);
    };
  }, [auth?.account]);

  // load desktop stuff
  useEffect(() => {
    // list stuff
    loadTasks();
    listShortcuts();
  }, [desktop?.id]);

  // return desktops
  const MoonDesktop = {
    get    : getDesktop,
    list   : listDesktops,
    update : updateDesktop,
    create : createDesktop,
    delete : deleteDesktop,

    // shortcuts
    getShortcut,
    listShortcuts,
    updateShortcut,
    createShortcut,
    deleteShortcut,

    // shortcuts
    getTask,
    loadTasks,
    updateTask,
    createTask,
    deleteTask,
    updateTasks,
    bringTaskToFront,
    findOrCreateTask,

    // group
    createGroup,
    updateGroup,
    removeGroup,

    tasks,
    desktop,
    loading,
    updated,
    desktops,
    shortcuts,
    activeTask,
  };

  // nft desktops
  window.MoonDesktop = MoonDesktop;

  // return jsx
  return (
    <DesktopContext.Provider value={ MoonDesktop }>
      { props.children }
    </DesktopContext.Provider>
  );
};

// export default
export default MoonDesktopProvider;