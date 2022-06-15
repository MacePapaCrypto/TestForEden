
// socketio client
import useAuth from './useAuth';
import useSocket from './useSocket';
import DesktopContext from './DesktopContext';
import React, { useEffect, useState } from 'react';


// socket context
const DesktopProvider = (props = {}) => {
  // socket
  const auth = useAuth();
  const socket = useSocket();

  // state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(null);
  const [updated, setUpdated] = useState(new Date());
  const [desktops, setDesktops] = useState([]);
  const [shortcuts, setShortcuts] = useState([]);

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
  const getDesktop = async (id) => {
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
  };

  // load
  const listDesktops = async () => {
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
  };

  // create
  const createDesktop = async ({
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
  };

  // create
  const updateDesktop = async ({
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
  };

  // create
  const deleteDesktop = async ({ id }) => {
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
  };

  // emit
  const emitDesktop = (desktop, isRemove = false) => {
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
  };

  // emit desktop remove
  const emitDesktopRemove = (desktop) => emitDesktop(desktop, true);


  ////////////////////////////////////////////////////////////////////
  //
  //  SHORTCUTS
  //
  ////////////////////////////////////////////////////////////////////

  // get shortcut
  const getShortcut = async (id) => {
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
  };

  // load
  const listShortcuts = async () => {
    // set loading
    setLoading('shortcuts');

    // loaded
    let loadedShortcuts = [];

    // try/catch
    try {
      // loaded
      loadedShortcuts = await socket.get('/shortcut/list');

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
  };

  // create
  const createShortcut = async ({
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
  };

  // create
  const updateShortcut = async ({
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
  };

  // create
  const deleteShortcut = async ({ id }) => {
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
  };

  // emit
  const emitShortcut = (shortcut, isRemove = false) => {
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
  };

  // emit shortcut remove
  const emitShortcutRemove = (shortcut) => emitShortcut(shortcut, true);


  ////////////////////////////////////////////////////////////////////
  //
  //  TASKS
  //
  ////////////////////////////////////////////////////////////////////

  // get task
  const getTask = async (id) => {
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
  };

  // load
  const listTasks = async () => {
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
  };

  // create
  const createTask = async ({
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
  };

  // create
  const updateTask = async ({
    id,
    type,
    order,
    parent,
    active,
    zIndex,
    position,
  }, save = true) => {
    // set loading
    if (save) setLoading(id);

    // update task
    let localTask = tasks.find((s) => s.id === id);

    // check local task
    if (!localTask) {
      // set task
      localTask = {
        id,
        type,
      };

      // push
      tasks.push(localTask);
    }

    // keys
    if (typeof type !== 'undefined') localTask.type = type;
    if (typeof order !== 'undefined') localTask.order = order;
    if (typeof parent !== 'undefined') localTask.parent = parent;
    if (typeof active !== 'undefined') localTask.active = active;
    if (typeof zIndex !== 'undefined') localTask.zIndex = zIndex;
    if (typeof position !== 'undefined') localTask.position = position;

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
        order,
        parent,
        active,
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
  };

  // update tsks
  const updateTasks = async (updates = tasks) => {
    // loading
    setLoading('update');

    // loaded
    let loadedTasks = [];

    // try/catch
    try {
      // load
      loadedTasks = await socket.post(`/task/updates`, {
        updates,
        desktop : desktop?.id,
      });

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
    } catch (e) {
      // loading
      setLoading(null);
      throw e;
    }

    // done loading
    setLoading(null);

    // return spaces
    return loadedTasks;
  };

  // create
  const deleteTask = async ({ id }) => {
    // set loading
    setLoading(id);

    // try/catch
    try {
      // tasks
      for (let i = (tasks.length - 1); i >= 0; i--) {
        // check if task
        if (id === tasks[i].id) {
          // removed
          tasks.splice(i, 1);
        }
      }

      // set tasks
      setUpdated(new Date());

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
  };

  // emit
  const emitTask = (task, isRemove = false) => {
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
  };

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
  const createGroup = async ({
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
  };

  /**
   * create group
   *
   * @param param0 
   * @returns 
   */
  const removeGroup = async ({
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
  };

  // create
  const updateGroup = async ({
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
  };
  
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
    listTasks();
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
    listTasks,
    updateTask,
    createTask,
    deleteTask,
    updateTasks,

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
export default DesktopProvider;