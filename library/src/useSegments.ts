
// import auth context
import useAuth from './useAuth';
import useSocket from './useSocket';
import React, { useEffect, useState } from 'react';

// use auth hook
const useSegments = (cacheTimeout = (60 * 1000)) => {
  // socket
  const auth = useAuth();
  const socket = useSocket();
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState([]);

  // get segment
  const getSegment = async (id) => {
    // check found
    if (!id) return;

    // check found
    const found = segments.find((s) => s.id === id);

    // check found
    if (found) return found;

    // load
    const backendSegment = await socket.get(`/segment/${id}`);

    // return backend segment
    return backendSegment;
  };

  // create
  const createSegment = async ({ name = null, type = 'segment', order = 0 }) => {
    // set loading
    setLoading(true);

    // loaded
    let loadedSegments = {
      created  : null,
      segments : [],
    };

    // try/catch
    try {
      // load
      loadedSegments = await socket.post('/segment', {
        name,
        type,
        order,

        account : auth?.account,
      }, cacheTimeout);

      // set segments
      setSegments(loadedSegments.segments);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // done loading
    setLoading(false);

    // return segments
    return loadedSegments.created;
  };

  // bulk segment updates
  const updateSegments = async (segments) => {
    // loading
    setLoading(true);

    // loaded
    let loadedSegments = [];

    // try/catch
    try {
      // load
      loadedSegments = await socket.post(`/segment/updates`, {
        segments,
      });

      // set segments
      setSegments(loadedSegments);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // done loading
    setLoading(false);

    // return segments
    return loadedSegments;
  };

  // create
  const updateSegment = async ({ id, name, order, open, parent }, save = true) => {
    // set loading
    if (save) setLoading(id);

    // update segment
    const localSegment = segments.find((s) => s.id === id);

    // keys
    if (typeof name !== 'undefined') localSegment.name = name;
    if (typeof open !== 'undefined') localSegment.open = open;
    if (typeof order !== 'undefined') localSegment.order = order;
    if (typeof parent !== 'undefined') localSegment.parent = parent;

    // update
    if (!save) {
      // update
      return setSegments([...segments]);
    } else {
      // update in place
      setSegments([...segments]);
    }

    // loaded
    let loadedSegments = {
      updated  : null,
      segments : [],
    };

    // try/catch
    try {
      // load
      loadedSegments = await socket.patch(`/segment/${id}`, {
        name,
        open,
        order,
        parent
      });

      // set segments
      setSegments(loadedSegments.segments);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // done loading
    setLoading(false);

    // return segments
    return loadedSegments.updated;
  };

  // create
  const deleteSegment = async ({ id }) => {
    // set loading
    setLoading(id);

    // loaded
    let loadedSegments = [];

    // try/catch
    try {
      // load
      loadedSegments = await socket.delete(`/segment/${id}`);

      // set segments
      setSegments(loadedSegments);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // done loading
    setLoading(false);

    // return segments
    return loadedSegments;
  };

  // load
  const listSegments = async () => {
    // set loading
    setLoading(true);

    // loaded
    let loadedSegments = [];

    // try/catch
    try {
      // loaded
      loadedSegments = await socket.get('/segment');

      // set segments
      setSegments(loadedSegments);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // set loading
    setLoading(false);

    // return segments
    return loadedSegments;
  };
  
  // load from socket
  useEffect(() => {
    // load from socket
    listSegments();

    // on connect
    socket.socket.on('connect', listSegments);

    // done
    return () => {
      // off connect
      socket.socket.removeListener('connect', listSegments);
    };
  }, [auth?.account]);

  // return segments
  return {
    get     : getSegment,
    list    : listSegments,
    update  : updateSegment,
    create  : createSegment,
    delete  : deleteSegment,
    updates : updateSegments,

    loading,
    segments,
  };
};

// export default
export default useSegments;