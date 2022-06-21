
// import app
import App, { Type } from '../base/app';
import SpaceModel from '../models/space';

/**
 * export default
 */
@Type('space')
class SpaceApp extends App {

  /**
   * menu
   */
  async menu() {
    // return menu
    return [
      {
        path : 'create',
        name : 'Create Space',
      },
      'divider',
      {
        path : 'account',
        name : 'My Spaces',
      },
      {
        path : 'hot',
        name : 'Hot Spaces',
      },
      {
        path : 'new',
        name : 'Latest Spaces',
      },
      {
        path : 'mooning',
        name : 'Mooning Spaces',
      },
      {
        path : 'following',
        name : 'Following Spaces',
      },
    ];
  }

  /**
   * listen for post
   *
   * @param socket 
   * @param post 
   */
  async spaceListener(socket, space) {
    // get post
    const actualSpace = await SpaceModel.findById(space.id);

    // check space
    if (!actualSpace) return;

    // send post to socket
    socket.emit('space', await actualSpace.toJSON({}, socket.account));
  }

  /**
   * sanitise
   */
  async toJSON(sanitised, path, cache = {}, req = {}) {
    // check type
    const menu = await this.menu();
    
    // lists
    const menuItem = menu.find((l) => l.path === path);

    // if no list
    if (menuItem) {
      // return
      return {
        default : {
          x : .1,
          y : .1,
  
          width  : .4,
          height : .4,
        },

        ...sanitised,

        name : menuItem.name,
        feed : menuItem.path,
      };
    }

    // load space
    const [space, action] = path.split('/');
    
    // actual space
    const actualSpace = await SpaceModel.findById(space);

    // sanitised space
    const sanitisedSpace = actualSpace ? await actualSpace.toJSON(cache, req?.account) : {};

    // subscribe
    if (actualSpace && req?.subscribe) {
      // subscribe to space
      req.subscribe(`space:${actualSpace.get('id')}`, this.spaceListener);
      req.subscribe(`space+space:${actualSpace.get('id')}`, this.spaceListener);

    }

    // return object
    return {
      default : {
        x : .1,
        y : .1,

        width  : action === 'create' ? .4 : .8,
        height : action === 'create' ? .4 : .8,
      },

      ...sanitised,

      name  : action === 'create' ? 'Create SubSpace' : sanitisedSpace?.name || sanitised.name,
      space : sanitisedSpace,
    };
  }
}

// new feed app
export default new SpaceApp();