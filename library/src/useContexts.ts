
// import auth context
import useAuth from './useAuth';
import useBrowse from './useBrowse';
import useSocket from './useSocket';
import React, { useEffect, useState } from 'react';

// use auth hook
const useContexts = (props = {}) => {
  // socket
  const auth = useAuth();
  const browse = useBrowse();
  const socket = useSocket();
  const [loading, setLoading] = useState(false);
  const [contexts, setContexts] = useState([]);

  // get context
  const getContext = async (id) => {
    // check found
    if (!id) return;

    // check found
    const found = contexts.find((s) => s.id === id);

    // check found
    if (found) return found;

    // load
    const backendContext = await socket.get(`/context/${id}`, {
      account : props.account,
      segment : props.segment,
    });

    // return backend context
    return backendContext;
  };

  // create
  const createContext = async ({ name = null, type = 'context', order = 0 }) => {
    // set loading
    setLoading(true);

    // loaded
    let loadedContexts = {
      created  : null,
      contexts : [],
    };

    // try/catch
    try {
      // load
      loadedContexts = await socket.post('/context', {
        name,
        type,
        order,

        account : props.account,
        segment : props.segment,
      });

      // set contexts
      setContexts(loadedContexts.contexts);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // done loading
    setLoading(false);

    // return contexts
    return loadedContexts.created;
  };

  // bulk context updates
  const updateContexts = async (contexts) => {
    // loading
    setLoading(true);

    // loaded
    let loadedContexts = [];

    // try/catch
    try {
      // load
      loadedContexts = await socket.post(`/context/updates`, {
        contexts,
      }, props.cacheTimeout || (60 * 1000));

      // set contexts
      setContexts(loadedContexts);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // done loading
    setLoading(false);

    // return contexts
    return loadedContexts;
  };

  // create
  const updateContext = async ({ id, name, order, open, parent }, save = true) => {
    // set loading
    if (save) setLoading(id);

    // update context
    const localContext = contexts.find((s) => s.id === id);

    // keys
    if (typeof name !== 'undefined') localContext.name = name;
    if (typeof open !== 'undefined') localContext.open = open;
    if (typeof order !== 'undefined') localContext.order = order;
    if (typeof parent !== 'undefined') localContext.parent = parent;

    // update
    if (!save) {
      // update
      return setContexts([...contexts]);
    } else {
      // update in place
      setContexts([...contexts]);
    }

    // loaded
    let loadedContexts = {
      updated  : null,
      contexts : [],
    };

    // try/catch
    try {
      // load
      loadedContexts = await socket.patch(`/context/${id}`, {
        name,
        open,
        order,
        parent,

        account : props.account,
        segment : props.segment,
      });

      // set contexts
      setContexts(loadedContexts.contexts);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // done loading
    setLoading(false);

    // return contexts
    return loadedContexts.updated;
  };

  // create
  const deleteContext = async ({ id }) => {
    // set loading
    setLoading(id);

    // loaded
    let loadedContexts = [];

    // try/catch
    try {
      // load
      loadedContexts = await socket.delete(`/context/${id}`, {
        account : props.account,
        segment : props.segment,
      });

      // set contexts
      setContexts(loadedContexts);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // done loading
    setLoading(false);

    // return contexts
    return loadedContexts;
  };

  // load
  const listContexts = async () => {
    // check contexts
    if (!props.account && !props.segment) {
      // done
      setLoading(false);
      return setContexts([]);
    }

    // set loading
    setLoading(true);
    setContexts([]);

    // loaded
    let loadedContexts = [];

    // try/catch
    try {
      // loaded
      loadedContexts = await socket.get('/context', {
        account : props.account,
        segment : props.segment,
      });

      // set contexts
      setContexts(loadedContexts);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // set loading
    setLoading(false);

    // return contexts
    return loadedContexts;
  };
  
  // load from socket
  useEffect(() => {
    // load from socket
    listContexts();

    // on connect
    socket.socket.on('connect', listContexts);

    // done
    return () => {
      // off connect
      socket.socket.removeListener('connect', listContexts);
    };
  }, [auth?.account, props.segment, props.account]);

  // return contexts
  return {
    get     : getContext,
    list    : listContexts,
    update  : updateContext,
    create  : createContext,
    delete  : deleteContext,
    updates : updateContexts,

    loading,
    contexts,
  };
};

// export default
export default useContexts;