

// import local
import JSON5 from 'json5';
import NFTController, { Route } from '../base/controller';

// models
import TaskModel from '../models/task';
import ThemeModel from '../models/theme';
import DesktopModel from '../models/desktop';
import ShortcutModel from '../models/shortcut';
import TaskGroupModel from '../models/taskGroup';
import ShortcutGroupModel from '../models/shortcutGroup';

/**
 * create auth controller
 */
export default class DesktopController extends NFTController {


  ////////////////////////////////////////////////////////////////////
  //
  //  DESKTOPS
  //
  ////////////////////////////////////////////////////////////////////

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/desktop/list')
  async desktopListAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // find by desktop
    const accountDesktops = lowerAccount ? await DesktopModel.findByAccount(lowerAccount) : [];
    const sessionDesktops = await DesktopModel.findBySession(req.ssid);

    // desktops
    const desktops = [
      ...accountDesktops,
      ...sessionDesktops,
    ];

    // check no desktops
    if (!desktops.length) {
      // load default desktop
      const defaultDesktop = new DesktopModel({
        refs : lowerAccount ? [
          `account:${lowerAccount}`,
        ] : [
          `session:${req.ssid}`,
        ],
        
        name    : 'Default',
        type    : 'default',
        order   : 0,
        account : lowerAccount,
        session : lowerAccount ? null : req.ssid,
      });

      // save default desktop
      await defaultDesktop.save();

      // push
      desktops.push(defaultDesktop);
    }

    // sanitised
    const sanitised = (await Promise.all(desktops.map((desktop) => desktop.toJSON()))).filter((s) => s).sort((a, b) => {
      // order
      const aO = a.order || 0;
      const bO = b.order || 0;
  
      // return
      if (aO < bO) return -1;
      if (aO > bO) return 1;
      return 0;
    }).map((item, order) => {
      // set order
      item.order = typeof item.order === 'undefined' ? order : item.order;
      return item;
    });

    // return
    return {
      result  : sanitised,
      success : true,
    };
  }

  /**
   * task get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/desktop/:id')
  async desktopGetAction(req, { data, params }, next) {
    // get segment
    const desktop = await DesktopModel.findById(params.id);

    // return segment
    return {
      result  : desktop ? await desktop.toJSON({}) : null,
      success : !!desktop,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('POST', '/api/v1/desktop')
  async desktopCreateAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      message : 'Account Required',
      success : false,
    };
    
    // create default segment
    const newDesktop = new DesktopModel({
      refs : `account:${lowerAccount}`,
      
      name    : data.name,
      type    : data.type,
      order   : data.order || 0,
      account : lowerAccount,
    });

    // save
    await newDesktop.save(null, true);

    // sanitised
    const sanitisedDesktop = await newDesktop.toJSON();

    // return
    return {
      result  : sanitisedDesktop,
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('PATCH', '/api/v1/desktop/:id')
  async desktopUpdateAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // load actual segment
    const updateDesktop = await DesktopModel.findById(params.id);

    // actual updates
    if (updateDesktop.get('account') !== lowerAccount && updateDesktop.get('session') !== req.ssid) {
      // save task
      return {
        message : 'Authentication Required',
        success : false,
      }
    }

    // set
    if (typeof data.name !== 'undefined') updateDesktop.set('name', data.name);
    if (typeof data.type !== 'undefined') updateDesktop.set('type', data.type);
    if (typeof data.order !== 'undefined') updateDesktop.set('order', data.order);

    // save
    await updateDesktop.save();

    // return
    return {
      result  : await updateDesktop.toJSON(),
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('DELETE', '/api/v1/desktop/:id')
  async desktopDeleteAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      message : 'Account Required',
      success : false,
    };

    // load actual segment
    const deleteDesktop = await DesktopModel.findById(params.id);

    // actual updates
    if (deleteDesktop.get('account') !== lowerAccount && deleteDesktop.get('session') !== req.ssid) return {
      message : 'Authentication Required',
      success : false,
    };

    // save
    await deleteDesktop.remove();

    // return
    return {
      result  : null,
      success : true,
    };
  }


  ////////////////////////////////////////////////////////////////////
  //
  //  SHORTCUTS
  //
  ////////////////////////////////////////////////////////////////////

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/shortcut/list')
  async shortcutListAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // lowerAccount
    const desktopId = data.desktop;

    // check desktop id
    if (!desktopId) return {
      success : false,
      message : 'Desktop not found',
    };

    // load desktop
    const desktop = await DesktopModel.findById(desktopId);

    // check desktop
    if (!desktop || (desktop.get('account') !== lowerAccount && desktop.get('session') !== req.ssid)) return {
      success : false,
      message : 'Desktop not found',
    };

    // groups
    const cache = {};

    // load segments
    const groups    = await ShortcutGroupModel.findByDesktop(desktopId);
    const shortcuts = await ShortcutModel.findByDesktop(desktopId);

    // sanitised
    const sanitised = [
      ...(await Promise.all(groups.map((group) => group.toJSON()))),
      ...(await Promise.all(shortcuts.map((task) => task.toJSON(cache, req)))),
    ].filter((s) => s).sort((a, b) => {
      // order
      const aO = a.order || 0;
      const bO = b.order || 0;
  
      // return
      if (aO < bO) return -1;
      if (aO > bO) return 1;
      return 0;
    }).map((item, order) => {
      // set order
      item.order = typeof item.order === 'undefined' ? order : item.order;
      return item;
    });

    // return
    return {
      result  : sanitised,
      success : true,
    };
  }

  /**
   * task get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/shortcut/:id')
  async shortcutGetAction(req, { data, params }, next) {
    // get segment
    const shortcut = await ShortcutModel.findById(params.id);

    // return segment
    return {
      result  : shortcut ? await shortcut.toJSON({}) : null,
      success : !!shortcut,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('POST', '/api/v1/shortcut')
  async shortcutCreateAction(req, { data, params }, next) {
    // lowerAccount
    const desktopId = data.desktop;
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!desktopId) return {
      message : 'Desktop not found',
      success : false,
    };

    // load desktop
    const desktop = await DesktopModel.findById(desktopId);

    // check desktop
    if (!desktop || (desktop.get('account') !== lowerAccount && desktop.get('session') !== req.ssid)) return {
      success : false,
      message : 'Desktop not found',
    };
    
    // create default segment
    const newShortcut = new ShortcutModel({
      refs : [
        `desktop:${data.desktop}`,
        lowerAccount ? `account:${lowerAccount}` : `session:${req.ssid}`,
      ],
      
      type    : data.type,
      path    : data.path,
      order   : data.order || 0,
      zIndex  : data.zIndex,
      account : lowerAccount,
      session : lowerAccount ? null : req.ssid,
      desktop : data.desktop,
    });

    // save
    await newShortcut.save(null, true);

    // sanitised
    const sanitisedShortcut = await newShortcut.toJSON();

    // return
    return {
      result  : sanitisedShortcut,
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('PATCH', '/api/v1/shortcut/:id')
  async shortcutUpdateAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // load actual segment
    const updateShortcut = await ShortcutModel.findById(params.id);

    // actual updates
    if (!updateShortcut) return {
      message : 'Shortcut Not Found',
      success : false,
    };

    // load desktop
    const desktop = await DesktopModel.findById(updateShortcut.get('desktop'));

    // check desktop
    if (!desktop || (desktop.get('account') !== lowerAccount && desktop.get('session') !== req.ssid)) return {
      success : false,
      message : 'Desktop not found',
    };

    // set
    if (typeof data.path !== 'undefined') updateShortcut.set('path', data.path);
    if (typeof data.order !== 'undefined') updateShortcut.set('order', data.order);
    if (typeof data.parent !== 'undefined') updateShortcut.set('parent', data.parent);

    // save
    await updateShortcut.save();

    // return
    return {
      result  : await updateShortcut.toJSON(),
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('DELETE', '/api/v1/shortcut/:id')
  async shortcutDeleteAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // load actual segment
    const deleteShortcut = await ShortcutModel.findById(params.id);

    // actual updates
    if (deleteShortcut.get('account') !== lowerAccount) {
      // save task
      return {
        message : 'Authentication Required',
        success : false,
      }
    }

    // save
    await deleteShortcut.remove();

    // return
    return {
      result  : null,
      success : true,
    };
  }


  ////////////////////////////////////////////////////////////////////
  //
  //  TASKS
  //
  ////////////////////////////////////////////////////////////////////

  /**
   * listen for post
   *
   * @param socket 
   * @param post 
   */
  async taskListener(socket, task) {
    // send post to socket
    socket.emit('task', task);
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/task/list')
  async taskListAction(req, { data, params }, next) {
    // lowerAccount
    const desktopId = data.desktop;
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check desktop id
    if (!desktopId) return {
      success : false,
      message : 'Desktop not found',
    };

    // load desktop
    const desktop = await DesktopModel.findById(desktopId);

    // check desktop
    if (!desktop || (desktop.get('account') !== lowerAccount && desktop.get('session') !== req.ssid)) return {
      success : false,
      message : 'Desktop not found',
    };

    // groups
    const cache = {};

    // load segments
    const tasks  = await TaskModel.findByDesktop(desktopId);
    const groups = await TaskGroupModel.findByDesktop(desktopId);

    // check tasks
    if (desktop.get('type') === 'default' && !tasks.length && false) {
      // set default tasks
      const defaultTasks = [
        new TaskModel({
          refs : [
            `desktop:${desktop.get('id')}`,
            lowerAccount ? `account:${lowerAccount}` : `session:${req.ssid}`,
          ],
          
          type    : 'feed',
          path    : 'public',
          order   : 0,
          default : {
            y      : 0,
            x      : 0,
            width  : .55,
            height : 1,
          },
          account : lowerAccount,
          session : lowerAccount ? null : req.ssid,
          desktop : desktop.get('id'),
        }),
        new TaskModel({
          refs : [
            `desktop:${desktop.get('id')}`,
            lowerAccount ? `account:${lowerAccount}` : `session:${req.ssid}`,
          ],
          
          type    : 'contract',
          path    : 'mooning',
          order   : 1,
          default : {
            y      : 0,
            x      : .55,
            width  : .45,
            height : .5,
          },
          account : lowerAccount,
          session : lowerAccount ? null : req.ssid,
          desktop : desktop.get('id'),
        }),
        new TaskModel({
          refs : [
            `desktop:${desktop.get('id')}`,
            lowerAccount ? `account:${lowerAccount}` : `session:${req.ssid}`,
          ],
          
          type    : 'space',
          path    : 'mooning',
          order   : 2,
          default : {
            y      : .5,
            x      : .55,
            width  : .45,
            height : .5,
          },
          account : lowerAccount,
          session : lowerAccount ? null : req.ssid,
          desktop : desktop.get('id'),
        }),
      ];

      // save
      await Promise.all(defaultTasks.map((task) => task.save()));

      // push
      tasks.push(...defaultTasks);
    }

    // subscribe
    req.subscribe(`task+desktop:${desktopId}`, this.taskListener);

    // sanitised
    const sanitised = [
      ...(await Promise.all(tasks.map((task) => task.toJSON(cache, req)))),
      ...(await Promise.all(groups.map((group) => group.toJSON()))),
    ].filter((s) => s).sort((a, b) => {
      // order
      const aO = a.order || 0;
      const bO = b.order || 0;
  
      // return
      if (aO < bO) return -1;
      if (aO > bO) return 1;
      return 0;
    }).map((item, order) => {
      // set order
      item.order = typeof item.order === 'undefined' ? order : item.order;
      return item;
    });

    // return
    return {
      result  : sanitised,
      success : true,
    };
  }

  /**
   * task get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/task/:id')
  async taskGetAction(req, { data, params }, next) {
    // get segment
    const task = await TaskModel.findById(params.id);

    // return segment
    return {
      result  : task ? await task.toJSON({}, req) : null,
      success : !!task,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('POST', '/api/v1/task')
  async taskCreateAction(req, { data, params }, next) {
    // lowerAccount
    const desktopId = data.desktop;
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check desktop id
    if (!desktopId) return {
      success : false,
      message : 'Desktop not found',
    };

    // load desktop
    const desktop = await DesktopModel.findById(desktopId);

    // check desktop
    if (!desktop || (desktop.get('account') !== lowerAccount && desktop.get('session') !== req.ssid)) return {
      success : false,
      message : 'Desktop not found',
    };
    
    // create default segment
    const newTask = new TaskModel({
      refs : [
        `app:${data.app}`,
        `desktop:${desktop.get('id')}`,
        lowerAccount ? `account:${lowerAccount}` : `session:${req.ssid}`,
      ],
      
      app     : data.app,
      path    : data.path,
      order   : data.order || 0,
      zIndex  : data.zIndex,
      account : lowerAccount,
      session : lowerAccount ? null : req.ssid,
      desktop : desktop.get('id'),
    });

    // save
    await newTask.save(null, true);

    // sanitised
    const sanitisedTask = await newTask.toJSON({}, req);

    // return
    return {
      result  : sanitisedTask,
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('PATCH', '/api/v1/task/:id')
  async taskUpdateAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (false && !lowerAccount) return {
      message : 'Account Required',
      success : false,
    };

    // create lock
    const unlock = await this.base.pubsub.lock(params.id);

    // load actual segment
    const updateTask = await TaskModel.findById(params.id);

    // actual updates
    if (false && (!updateTask || updateTask.get('account') !== lowerAccount)) {
      // unlock
      unlock();

      // return
      return {
        message : 'Task not Found',
        success : false,
      };
    }

    // load desktop
    const desktop = await DesktopModel.findById(updateTask.get('desktop'));

    // check desktop
    if (!desktop || (desktop.get('account') !== lowerAccount && desktop.get('session') !== req.ssid)) {
      // unlock
      unlock();

      // return
      return {
        success : false,
        message : 'Desktop not found',
      };
    }

    // set
    if (typeof data.path !== 'undefined') updateTask.set('path', data.path);
    if (typeof data.order !== 'undefined') updateTask.set('order', data.order);
    if (typeof data.parent !== 'undefined') updateTask.set('parent', data.parent);
    if (typeof data.zIndex !== 'undefined') updateTask.set('zIndex', data.zIndex);
    if (typeof data.position !== 'undefined') updateTask.set('position', data.position);

    // save
    await updateTask.save();

    // unlock
    unlock();

    // return
    return {
      result  : await updateTask.toJSON({}, req),
      success : true,
    };
  }

  /**
   * sidebar endpoint
   * 
   * @returns
   */
  @Route('POST', '/api/v1/task/updates')
  async taskUpdatesAction(req, { data, params }, next) {
    // lowerAccount
    const desktopId = data.desktop;
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check desktop id
    if (!desktopId) return {
      success : false,
      message : 'Desktop not found',
    };

    // load desktop
    const desktop = await DesktopModel.findById(desktopId);

    // check desktop
    if (!desktop || (desktop.get('account') !== lowerAccount && desktop.get('session') !== req.ssid)) return {
      success : false,
      message : 'Desktop not found',
    };

    // all tasks
    const allTasks = [
      ...(await TaskModel.findByDesktop(desktopId)),
      ...(await TaskGroupModel.findByDesktop(desktopId)),
    ];

    // cache
    const result = [];
    const sanitiseCache = {};

    // loop tasks
    await Promise.all(data.updates.map(async (subData) => {
      // find segment
      const foundTask = allTasks.find((s) => s.get('id') === subData.id);

      // check segment
      if (!foundTask) return;

      // create lock
      const unlock = await this.base.pubsub.lock(foundTask.get('id'));

      // try/catch
      try {
        // set values
        if (typeof subData.order !== 'undefined') foundTask.set('order', subData.order);
        if (typeof subData.parent !== 'undefined') foundTask.set('parent', subData.parent);
        if (typeof subData.zIndex !== 'undefined') foundTask.set('zIndex', subData.zIndex);
        if (typeof subData.position !== 'undefined') foundTask.set('position', subData.position);

        // save
        await foundTask.save();
      } catch (e) {}

      // unlock
      unlock();

      // push segment
      result.push(await foundTask.toJSON(sanitiseCache, req));
    }));

    // return
    return {
      result,
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('DELETE', '/api/v1/task/:id')
  async taskDeleteAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // create lock
    const unlock = await this.base.pubsub.lock(params.id);

    // load actual segment
    const deleteTask = await TaskModel.findById(params.id);

    // check desktop
    if (!deleteTask || (deleteTask.get('account') !== lowerAccount && deleteTask.get('session') !== req.ssid)) {
      // unlock
      unlock();

      // return
      return {
        success : false,
        message : 'Desktop not found',
      };
    }
    
    // unlock
    unlock();

    // save
    await deleteTask.remove();

    // return
    return {
      result  : null,
      success : true,
    };
  }


  ////////////////////////////////////////////////////////////////////
  //
  //  GROUPS
  //
  ////////////////////////////////////////////////////////////////////

  /**
   * group action
   *
   * @param req 
   * @param param1 
   * @param next 
   */
  @Route('POST', '/api/v1/group/:type')
  async groupCreateAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      message : 'Account Required',
      success : false,
    };

    // class
    const ModelClass = params.type === 'task' ? TaskGroupModel : ShortcutGroupModel;

    // create group model
    const newGroup = new ModelClass({
      refs : [
        `desktop:${data.desktop}`,
        lowerAccount ? `account:${lowerAccount}` : `session:${req.ssid}`,
      ],

      order   : data.order,
      zIndex  : data.zIndex,
      account : lowerAccount,
      session : lowerAccount ? null : req.ssid,
      desktop : data.desktop,
    });

    // save
    await newGroup.save();

    // sanitised
    const sanitisedGroup = await newGroup.toJSON();

    // return
    return {
      result  : sanitisedGroup,
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('PATCH', '/api/v1/group/:type/:id')
  async groupUpdateAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      result  : 'Account Required',
      success : false,
    };

    // class
    const ModelClass = params.type === 'task' ? TaskGroupModel : ShortcutGroupModel;

    // load actual segment
    const updateGroup = await ModelClass.findById(params.id);

    // check account
    // @todo proper acl
    if (!updateGroup || updateGroup.get('account').toLowerCase() !== lowerAccount) return {
      message : 'Permission Denied',
      success : false,
    };

    // update member
    if (typeof data.open !== 'undefined') updateGroup.set('open', data.open);
    if (typeof data.order !== 'undefined') updateGroup.set('order', data.order);
    if (typeof data.parent !== 'undefined') updateGroup.set('parent', data.parent);
    if (typeof data.zIndex !== 'undefined') updateGroup.set('zIndex', data.zIndex);
    if (typeof data.desktop !== 'undefined') updateGroup.set('desktop', data.desktop);

    // save
    await updateGroup.save();

    // sanitised
    const sanitisedGroup = await updateGroup.toJSON();

    // return
    return {
      result  : sanitisedGroup,
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('DELETE', '/api/v1/group/:type/:id')
  async groupRemoveAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      result  : 'Account Required',
      success : false,
    };

    // class
    const ModelClass = params.type === 'task' ? TaskGroupModel : ShortcutGroupModel;

    // load actual segment
    const updateGroup = await ModelClass.findById(params.id);

    // check account
    // @todo proper acl
    if (!updateGroup || updateGroup.get('account').toLowerCase() !== lowerAccount) return {
      success : false,
      message : 'Permission Denied',
    };

    // save
    await updateGroup.remove();

    // return
    return {
      result  : true,
      success : true,
    };
  }


  ////////////////////////////////////////////////////////////////////
  //
  //  THEMES
  //
  ////////////////////////////////////////////////////////////////////

  /**
   * listen for post
   *
   * @param socket 
   * @param post 
   */
  async themeListener(socket, theme) {
    // send post to socket
    socket.emit('theme', theme);
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/theme/list')
  async themeListAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check desktop id
    if (!lowerAccount) return {
      success : false,
      message : 'Authentication Required',
    };
    
    // load themes
    const themes = await ThemeModel.findByAccount(lowerAccount);

    // check themes
    if (!themes.length) {
      // create new theme
      const newTheme = new ThemeModel({
        refs : [
          lowerAccount ? `account:${lowerAccount}` : `session:${req.ssid}`,
        ],
  
        theme    : {},
        account  : lowerAccount,
        session  : lowerAccount ? null : req.ssid,
        chosenAt : new Date(),
      });

      // save
      await newTheme.save();

      // push to themes
      themes.push(newTheme);
    }

    // subscribe
    req.subscribe(`theme+account:${lowerAccount}`, this.themeListener);

    // return
    return {
      result  : await Promise.all(themes.map((t) => t.toJSON())),
      success : true,
    };
  }

  /**
   * group action
   *
   * @param req 
   * @param param1 
   * @param next 
   */
  @Route('POST', '/api/v1/theme')
  async themeCreateAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check desktop id
    if (!lowerAccount) return {
      success : false,
      message : 'Authentication Required',
    };

    // create group model
    const newTheme = new ThemeModel({
      refs : [
        lowerAccount ? `account:${lowerAccount}` : `session:${req.ssid}`,
      ],

      theme    : data.theme || {},
      account  : lowerAccount,
      session  : lowerAccount ? null : req.ssid,
      chosenAt : data.chosen ? new Date() : null,
    });

    // save
    await newTheme.save();

    // sanitised
    const sanitisedTheme = await newTheme.toJSON();

    // return
    return {
      result  : sanitisedTheme,
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('PATCH', '/api/v1/theme/:id')
  async themeUpdateAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      message : 'Authentication Required',
      success : false,
    };

    // load actual segment
    const updateTheme = await ThemeModel.findById(params.id);

    // check account
    // @todo proper acl
    if (!updateTheme || updateTheme.get('account').toLowerCase() !== lowerAccount) return {
      message : 'Permission Denied',
      success : false,
    };

    // update member
    if (typeof data.theme !== 'undefined') updateTheme.set('theme', JSON5.stringify(data.theme || {}));
    if (typeof data.chosen !== 'undefined') updateTheme.set('chosenAt', new Date());

    // save
    await updateTheme.save();

    // sanitised
    const sanitisedTheme = await updateTheme.toJSON();

    // return
    return {
      result  : sanitisedTheme,
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('DELETE', '/api/v1/theme/:id')
  async themeRemoveAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      message : 'Authentication Required',
      success : false,
    };

    // load actual segment
    const updateTheme = await ThemeModel.findById(params.id);

    // check account
    // @todo proper acl
    if (!updateTheme || updateTheme.get('account').toLowerCase() !== lowerAccount) return {
      message : 'Permission Denied',
      success : false,
    };

    // save
    await updateTheme.remove();

    // return
    return {
      result  : true,
      success : true,
    };
  }
}