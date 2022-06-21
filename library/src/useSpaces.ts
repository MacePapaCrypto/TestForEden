
// import auth context
import useAuth from './useAuth';
import useSocket from './useSocket';
import React, { useEffect, useState } from 'react';

// use auth hook
const useSpaces = (props = {}) => {
  // socket
  const auth = useAuth();
  const socket = useSocket();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState('list');
  const [updated, setUpdated] = useState(new Date());

  // cache timeout
  const cacheTimeout = props.timeout || props.cache || (60 * 1000);

  // get space
  const getSpace = async (id) => {
    // check found
    if (!id) return;

    // check found
    const found = spaces.find((s) => s.id === id);

    // check found
    if (found) return found;

    // load
    const backendSpace = await socket.get(`/space/${id}`);

    // return backend space
    return backendSpace;
  };

  // emit
  const emitSpace = (space, isRemove = false) => {
    // update post
    const parentId = props.requireSpace ? (props.space?.id || props.space || 'null') : (props.space?.id || props.space);

    // check parent
    if (parentId && (parentId !== space.space)) return;

    // remove
    if (isRemove) {
      // spaces
      for (let i = (spaces.length - 1); i >= 0; i--) {
        // check if space
        if (space.id === spaces[i].id) {
          // removed
          spaces.splice(i, 1);
        }
      }

      // update
      setUpdated(new Date());
    } else {
      // update
      updateSpace(space, false);
    }
  };

  // emit space remove
  const emitSpaceRemove = (space) => emitSpace(space, true);

  // create
  const createSpace = async ({
    nfts        = [],
    feed        = null,
    name        = null,
    image       = {},
    order       = 0,
    space       = props.space,
    privacy     = 'public',
    description = '',
  }) => {
    // set loading
    setLoading('create');

    // loaded
    let createdSpace = {};

    // try/catch
    try {
      // load
      createdSpace = await socket.post('/space', {
        name,
        nfts,
        feed,
        space,
        image,
        order,
        privacy,
        description,

        account : auth?.account,
      }, cacheTimeout);

      // set spaces
      updateSpace(createdSpace, false);
    } catch (e) {
      // loading
      setLoading(null);
      throw e;
    }

    // done loading
    setLoading(null);

    // return spaces
    return createdSpace;
  };

  // bulk space updates
  const updateSpaces = async (updates = spaces) => {
    // loading
    setLoading('update');

    // loaded
    let loadedSpaces = [];

    // try/catch
    try {
      // load
      loadedSpaces = await socket.post(`/space/sidebar`, {
        space  : props.space,
        spaces : updates,
      });

      // replace all info
      loadedSpaces.forEach((space) => {
        // local
        const localSpace = spaces.find((s) => s.id === space.id);

        // check local space
        if (!localSpace) return spaces.push(space);

        // update info
        Object.keys(space).forEach((key) => {
          // space key
          localSpace[key] = space[key];
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
    return loadedSpaces;
  };

  // create
  const updateSpace = async ({
    id,
    type,
    nfts,
    name,
    image,
    order,
    parent,
    privacy,
    description,
  }, save = true) => {
    // set loading
    if (save) setLoading(id);

    // update space
    let localSpace = spaces.find((s) => s.id === id);

    // check local space
    if (!localSpace) {
      // set space
      localSpace = {
        id,
        type,
      };

      // push
      spaces.push(localSpace);
    }

    // keys
    if (typeof nfts !== 'undefined') localSpace.nfts = nfts;
    if (typeof name !== 'undefined') localSpace.name = name;
    if (typeof image !== 'undefined') localSpace.image = image;
    if (typeof order !== 'undefined') localSpace.order = order;
    if (typeof parent !== 'undefined') localSpace.parent = parent;
    if (typeof privacy !== 'undefined') localSpace.privacy = privacy;
    if (typeof description !== 'undefined') localSpace.description = description;

    // update
    if (!save) {
      // update
      return setUpdated(new Date());
    } else {
      // update in place
      setUpdated(new Date());
    }

    // loaded
    let loadedSpace = localSpace;

    // try/catch
    try {
      // load
      loadedSpace = await socket.patch(`/space/${id}`, {
        name,
        open,
        order,
        parent
      });

      // loop
      Object.keys(loadedSpace).forEach((key) => {
        // add to loaded
        localSpace[key] = loadedSpace[key];
      });

      // set spaces
      setUpdated(new Date());
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    setLoading(null);

    // return spaces
    return loadedSpace;
  };

  // create
  const deleteSpace = async ({ id }) => {
    // set loading
    setLoading(id);

    // try/catch
    try {
      // load
      await socket.delete(`/space/${id}`);

      // spaces
      for (let i = (spaces.length - 1); i >= 0; i--) {
        // check if space
        if (id === spaces[i].id) {
          // removed
          spaces.splice(i, 1);
        }
      }

      // set spaces
      setUpdated(new Date());
    } catch (e) {
      // loading
      throw e;
    }

    // done loading
    setLoading(null);

    // return spaces
    return true;
  };

  // load
  const listSpaces = async () => {
    // check space
    if (props.requireSpace && !props.space) return;

    // set loading
    setLoading('list');

    // loaded
    let loadedSpaces = [];

    // try/catch
    try {
      // loaded
      loadedSpaces = await socket.get('/space/list', {
        space : props.space?.id || props.space,
      });

      // spaces
      for (let i = (spaces.length - 1); i >= 0; i--) {
        // check if space
        if (!loadedSpaces.find((s) => s.id === spaces[i].id)) {
          // removed
          spaces.splice(i, 1);
        }
      }

      // replace all info
      loadedSpaces.forEach((space) => {
        // local
        const localSpace = spaces.find((s) => s.id === space.id);

        // check local space
        if (!localSpace) return spaces.push(space);

        // update info
        Object.keys(space).forEach((key) => {
          // space key
          localSpace[key] = space[key];
        });
      });

      // set spaces
      setUpdated(new Date());
    } catch (e) {
      // loading
      setLoading(null);
      throw e;
    }

    // set loading
    setLoading(null);

    // return spaces
    return loadedSpaces;
  };
  
  // load from socket
  useEffect(() => {
    // load from socket
    listSpaces();

    // on connect
    socket.socket.on('space', emitSpace);
    socket.socket.on('connect', listSpaces);
    socket.socket.on('space+remove', emitSpaceRemove);

    // done
    return () => {
      // off connect
      socket.socket.removeListener('space', emitSpace);
      socket.socket.removeListener('connect', listSpaces);
      socket.socket.removeListener('space+remove', emitSpaceRemove);
    };
  }, [auth?.account, (props.space?.id || props.space)]);

  // return spaces
  const MoonSpaces = {
    get     : getSpace,
    list    : listSpaces,
    update  : updateSpace,
    create  : createSpace,
    delete  : deleteSpace,
    updates : updateSpaces,

    spaces,
    loading,
    updated,
  };

  // nft spaces
  if (spaces?.length) window.MoonSpaces = MoonSpaces;

  // return
  return MoonSpaces;
};

// export default
export default useSpaces;