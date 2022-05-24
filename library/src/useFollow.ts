
// import auth post
import useAuth from './useAuth';
import useSocket from './useSocket';
import React, { useState, useEffect } from 'react';

// use auth hook
const useFollow = (subject, type = 'space') => {
  // socket
  const auth = useAuth();
  const socket = useSocket();

  // auth
  const [follow, setFollow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState(subject?.count?.followers || 0);
  const [following, setFollowing] = useState(subject?.count?.following || 0);

  // get post
  const loadFollow = async (id = null) => {
    // check found
    if (!id) id = subject?.id || subject;

    // check id
    if (!id) return;

    // check auth
    if (!auth.account) return;

    // loading
    setLoading(true);

    // load
    const backendFollow = await socket.get(`/follow/${id}`);

    console.log('test', id, backendFollow);

    // set post
    setFollow(backendFollow);
    setLoading(false);

    // return backend post
    return backendFollow;
  };

  // add follow
  const addFollow = async () => {
    // check auth
    if (!auth.account) return auth.login();

    // check found
    const id = subject?.id || subject;

    // check id
    if (!id) return;

    // loading
    setLoading(true);

    // load
    const {
      count  : backendCount,
      follow : backendFollow,
    } = await socket.post(`/follow/${id}`, {
      type,
    });

    // set post
    setFollow(backendFollow);
    setFollowers(backendCount);
    setLoading(false);

    // return backend post
    return backendFollow;
  };

  // remove follow
  const removeFollow = async () => {
    // check auth
    if (!auth.account) return auth.login();

    // check found
    const id = subject?.id || subject;

    // check id
    if (!id) return;

    // loading
    setLoading(true);

    // load
    const {
      count : backendCount,
    } = await socket.delete(`/follow/${id}`, {
      type,
    });

    // set post
    setFollow(null);
    setFollowers(backendCount);
    setLoading(false);

    // return backend post
    return true;
  };

  // emit user
  const emitFollow = (follow, count) => {
    // check found
    const id = subject?.id || subject;

    // update post
    if (follow.from === id) {
      // update
      setFollow(follow);
      setFollowers(count);
    }
  };

  // use effect
  useEffect(() => {
    // check loading
    if (auth.loading) return;
    
    // check found
    const id = subject?.id || subject;

    // update
    if (id) {
      loadFollow();
    }

    // add listener
    socket.socket.on('follow', emitFollow);

    // done
    return () => {
      // off
      socket.socket.removeListener('follow', emitFollow);
    };
  }, [subject?.id || subject, type, auth.loading]);

  // return posts
  const actualFollow = {
    load   : loadFollow,
    create : addFollow,
    remove : removeFollow,

    follow,
    loading,
    followers,
    following,
  };

  // window
  window.NFTFollow = actualFollow;

  // return post
  return actualFollow;
};

// export default
export default useFollow;