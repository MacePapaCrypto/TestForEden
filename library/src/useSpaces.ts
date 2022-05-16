
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
  const [loading, setLoading] = useState(true);

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

  // create
  const createSpace = async ({
    nfts        = [],
    name        = null,
    image       = {},
    order       = 0,
    space       = props.space,
    privacy     = 'public',
    description = '',
  }) => {
    // set loading
    setLoading(true);

    // loaded
    let createdSpace = {};

    // try/catch
    try {
      // load
      createdSpace = await socket.post('/space', {
        name,
        nfts,
        space,
        image,
        order,
        parent,
        privacy,
        description,

        account : auth?.account,
      }, cacheTimeout);

      // set spaces
      updateSpace(createdSpace, false);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // done loading
    setLoading(false);

    // return spaces
    return createdSpace;
  };

  // bulk space updates
  const updateSpaces = async (spaces) => {
    // loading
    setLoading(true);

    // loaded
    let loadedSpaces = [];

    // try/catch
    try {
      // load
      loadedSpaces = await socket.post(`/space/updates`, {
        spaces,
      });

      // set spaces
      setSpaces(loadedSpaces);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // done loading
    setLoading(false);

    // return spaces
    return loadedSpaces;
  };

  // create
  const updateSpace = async ({
    id,
    nfts,
    name,
    open,
    image,
    order,
    parent,
    privacy,
    description,

    space = props.space,
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
        nfts,
        name,
        open,
        image,
        order,
        space,
        parent,
        privacy,
        description,
      };

      // push
      spaces.push(localSpace);
    }

    // keys
    if (typeof nfts !== 'undefined') localSpace.nfts = nfts;
    if (typeof name !== 'undefined') localSpace.name = name;
    if (typeof open !== 'undefined') localSpace.open = open;
    if (typeof image !== 'undefined') localSpace.image = image;
    if (typeof order !== 'undefined') localSpace.order = order;
    if (typeof parent !== 'undefined') localSpace.parent = parent;
    if (typeof privacy !== 'undefined') localSpace.privacy = privacy;
    if (typeof description !== 'undefined') localSpace.description = description;

    // update
    if (!save) {
      // update
      return setSpaces([...spaces]);
    } else {
      // update in place
      setSpaces([...spaces]);
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
      setSpaces([...spaces]);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // done loading
    setLoading(false);

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

      // set spaces
      setSpaces(spaces.filter((s) => s.id !== id));
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // done loading
    setLoading(false);

    // return spaces
    return true;
  };

  // load
  const listSpaces = async () => {
    // check space
    if (props.requireSpace && !props.space) return;

    // set loading
    setLoading(true);

    // loaded
    let loadedSpaces = [];

    // try/catch
    try {
      // loaded
      loadedSpaces = await socket.get('/space', {
        space : props.space,
      });

      // set spaces
      setSpaces(loadedSpaces);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // set loading
    setLoading(false);

    // return spaces
    return loadedSpaces;
  };
  
  // load from socket
  useEffect(() => {
    // load from socket
    listSpaces();

    // on connect
    socket.socket.on('connect', listSpaces);

    // done
    return () => {
      // off connect
      socket.socket.removeListener('connect', listSpaces);
    };
  }, [auth?.account, props.space]);

  // return spaces
  return {
    get     : getSpace,
    list    : listSpaces,
    update  : updateSpace,
    create  : createSpace,
    delete  : deleteSpace,
    updates : updateSpaces,

    loading,
    spaces,
  };
};

// export default
export default useSpaces;