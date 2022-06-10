

// import local
import NFTController, { Route } from '../base/controller';

// models
import TaskModel from '../models/task';
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

    // check lower account
    if (!lowerAccount) return {
      result  : [],
      success : true,
    };

    // find by desktop
    const desktops = await DesktopModel.findByAccount(lowerAccount);

    // check no desktops
    if (!desktops.length) {
      // load default desktop
      const defaultDesktop = new DesktopModel({
        refs : [
          `desktop:${data.desktop}`,
          `account:${lowerAccount}`,
        ],
        
        name    : 'Default',
        type    : 'default',
        order   : 0,
        account : lowerAccount,
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
      refs : [
        `desktop:${data.desktop}`,
        `account:${lowerAccount}`,
      ],
      
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

    // check account
    if (!lowerAccount) return {
      message : 'Account Required',
      success : false,
    };

    // load actual segment
    const updateDesktop = await DesktopModel.findById(params.id);

    // actual updates
    if (updateDesktop.get('account') !== lowerAccount) {
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
    if (deleteDesktop.get('account') !== lowerAccount) {
      // save task
      return {
        message : 'Authentication Required',
        success : false,
      }
    }

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
    const desktopId = data.desktop;

    // check desktop id
    if (!desktopId) return {
      success : false,
      message : 'Desktop not found',
    };

    // load segments
    const groups    = await ShortcutGroupModel.findByDesktop(desktopId);
    const shortcuts = await ShortcutModel.findByDesktop(desktopId);

    // sanitised
    const sanitised = [
      ...(await Promise.all(groups.map((group) => group.toJSON()))),
      ...(await Promise.all(shortcuts.map((task) => task.toJSON()))),
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
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      message : 'Account Required',
      success : false,
    };
    
    // create default segment
    const newShortcut = new ShortcutModel({
      refs : [
        `desktop:${data.desktop}`,
        `account:${lowerAccount}`,
      ],
      
      type    : data.type,
      path    : data.path,
      order   : data.order || 0,
      zIndex  : data.zIndex,
      account : lowerAccount,
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

    // check account
    if (!lowerAccount) return {
      message : 'Account Required',
      success : false,
    };

    // load actual segment
    const updateShortcut = await ShortcutModel.findById(params.id);

    // actual updates
    if (updateShortcut.get('account') !== lowerAccount) {
      // save task
      return {
        message : 'Authentication Required',
        success : false,
      }
    }

    // set
    if (typeof data.path !== 'undefined') updateShortcut.set('path', data.path);
    if (typeof data.order !== 'undefined') updateShortcut.set('order', data.order);
    if (typeof data.parent !== 'undefined') updateShortcut.set('parent', data.parent);
    if (typeof data.desktop !== 'undefined') updateShortcut.set('desktop', data.desktop);

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

    // check account
    if (!lowerAccount) return {
      message : 'Account Required',
      success : false,
    };

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
   * segment get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/task/list')
  async taskListAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      message : 'Account Required',
      success : false,
    };

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
    if (!desktop) return {
      success : false,
      message : 'Desktop not found',
    };

    // @todo check id

    // load segments
    const tasks  = await TaskModel.findByDesktop(desktopId);
    const groups = await TaskGroupModel.findByDesktop(desktopId);

    // check tasks
    if (desktop.get('type') === 'default' && !tasks.length) {
      // set default tasks
      const defaultTasks = [
        new TaskModel({
          refs : [
            `desktop:${desktop.get('id')}`,
            `account:${lowerAccount}`,
          ],
          
          type    : 'feed',
          path    : 'public',
          order   : 0,
          default : 'left',
          account : lowerAccount,
          desktop : desktop.get('id'),
        }),
      ];

      // save
      await Promise.all(defaultTasks.map((task) => task.save()));

      // push
      tasks.push(...defaultTasks);
    }

    // sanitised
    const sanitised = [
      ...(await Promise.all(tasks.map((task) => task.toJSON()))),
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
      result  : task ? await task.toJSON({}) : null,
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
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      message : 'Account Required',
      success : false,
    };
    
    // create default segment
    const newTask = new TaskModel({
      refs : [
        `desktop:${data.desktop}`,
        `account:${lowerAccount}`,
      ],
      
      type    : data.type,
      path    : data.path,
      order   : data.order || 0,
      zIndex  : data.zIndex,
      account : lowerAccount,
      desktop : data.desktop,
    });

    // save
    await newTask.save(null, true);

    // sanitised
    const sanitisedTask = await newTask.toJSON();

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
    if (!lowerAccount) return {
      message : 'Account Required',
      success : false,
    };

    // load actual segment
    const updateTask = await TaskModel.findById(params.id);

    // actual updates
    if (updateTask.get('account') !== lowerAccount) {
      // save task
      return {
        message : 'Authentication Required',
        success : false,
      }
    }

    // set
    if (typeof data.path !== 'undefined') updateTask.set('path', data.path);
    if (typeof data.order !== 'undefined') updateTask.set('order', data.order);
    if (typeof data.active !== 'undefined') updateTask.set('active', data.active);
    if (typeof data.parent !== 'undefined') updateTask.set('parent', data.parent);
    if (typeof data.zIndex !== 'undefined') updateTask.set('zIndex', data.zIndex);
    if (typeof data.desktop !== 'undefined') updateTask.set('desktop', data.desktop);
    if (typeof data.position !== 'undefined') updateTask.set('position', data.position);

    // save
    await updateTask.save();

    // return
    return {
      result  : await updateTask.toJSON(),
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

    // check desktop id
    if (!desktopId) return {
      success : false,
      message : 'Desktop not found',
    };

    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      result  : 'Account Required',
      success : false,
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

      // set values
      if (typeof subData.order !== 'undefined') foundTask.set('order', subData.order);
      if (typeof subData.active !== 'undefined') foundTask.set('active', subData.active);
      if (typeof subData.parent !== 'undefined') foundTask.set('parent', subData.parent);
      if (typeof subData.zIndex !== 'undefined') foundTask.set('zIndex', subData.zIndex);
      if (typeof subData.position !== 'undefined') foundTask.set('position', subData.position);

      // push segment
      result.push(await foundTask.toJSON(sanitiseCache));
    }));

    // return
    return {
      result,
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
        `account:${lowerAccount}`,
      ],

      order   : data.order,
      zIndex  : data.zIndex,
      account : lowerAccount,
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
}