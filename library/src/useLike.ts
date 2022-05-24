
// import auth post
import useAuth from './useAuth';
import useSocket from './useSocket';
import React, { useState, useEffect } from 'react';

// use auth hook
const useLike = (subject, propsLike, type = 'post') => {
  // socket
  const auth = useAuth();
  const socket = useSocket();

  // auth
  const [like, setLike] = useState(propsLike || null);
  const [count, setCount] = useState(subject?.count?.likes || 0)
  const [loading, setLoading] = useState(false);

  // add like
  const toggleLike = async () => {
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
      like  : backendLike,
      count : backendCount,
    } = await socket.post(`/like/${id}`, {
      type,
    });

    // set post
    setLike(backendLike);
    setCount(backendCount);
    setLoading(false);

    // return backend post
    return backendLike;
  };

  // emit user
  const emitLike = (like, count) => {
    // check found
    const id = subject?.id || subject;

    // update post
    if (like.from === id) {
      // update
      setLike(like);
      setCount(count);
    }
  };

  // use effect
  useEffect(() => {
    // add listener
    socket.socket.on('like', emitLike);

    // done
    return () => {
      // off
      socket.socket.removeListener('like', emitLike);
    };
  }, [subject?.id || subject, type]);

  // use effect
  useEffect(() => {
    // set count
    setCount(subject?.count?.likes || 0);
  }, [subject?.count?.likes]);

  // return posts
  const actualLike = {
    toggle : toggleLike,

    like,
    count,
    loading,
  };

  // window
  window.NFTLike = actualLike;

  // return post
  return actualLike;
};

// export default
export default useLike;