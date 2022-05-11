
// import auth post
import useSocket from './useSocket';
import React, { useState, useEffect } from 'react';

// use auth hook
const usePost = (propsPost) => {
  // socket
  const socket = useSocket();
  const [post, setPost] = useState(null);
  const [updated, setUpdated] = useState(new Date());
  const [loading, setLoading] = useState(!post);

  // get post
  const loadPost = async (id = null) => {
    // check found
    if (!id) id = propsPost?.id || propsPost;

    // check id
    if (!id) return;

    // loading
    setLoading(true);

    // load
    const backendPost = await socket.get(`/post/${id}`);

    // set post
    setPost(backendPost);
    setLoading(false);

    // return backend post
    return backendPost;
  };

  // emit user
  const emitUser = (emitUser) => {
    // update post
    if (emitUser.id === post?.account) {
      // set user
      post.user = emitUser;

      // update
      setUpdated(new Date());
    }
  };

  // emit
  const emitPost = (emitPost) => {
    // update post
    if (emitPost.id === post?.id) {
      // replace keys
      Object.keys(emitPost).forEach((key) => post[key] = emitPost[key]);

      // update
      setUpdated(new Date());
    }
  };

  // create
  const updatePost = async ({ id, content, ...data }, save = true) => {
    // check found
    if (!id) id = post?.id || propsPost?.id || propsPost;

    // set loading
    if (save) setLoading(id);

    // update post
    const localPost = posts.find((s) => s.id === id);

    // local post
    if (localPost) {
      // keys
      if (typeof content !== 'undefined') localPost.content = content;

      // data
      Object.keys(data).forEach((key) => {
        localPost[key] = data[key];
      });
    }

    // update
    setUpdated(new Date());

    // update
    if (!save) return;

    // loaded
    let loadedPost;

    // try/catch
    try {
      // load
      loadedPost = await socket.patch(`/post/${id}`, {
        content,
      });

      // set posts
      emitPost(loadedPost);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // done loading
    setLoading(false);

    // return posts
    return loadedPost;
  };

  // create
  const deletePost = async ({ id }) => {
    // check found
    if (!id) id = post?.id || propsPost?.id || propsPost;

    // set loading
    setLoading(id);

    // try/catch
    try {
      // load
      await socket.delete(`/post/${id}`);
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // done loading
    setLoading(false);

    // return posts
    return true;
  };

  // use effect
  useEffect(() => {
    // update
    if (propsPost?.id || propsPost) {
      loadPost();
    } else {
      setPost(null);
    }

    // add listener
    socket.socket.on('user', emitUser);
    socket.socket.on('post', emitPost);

    // done
    return () => {
      // off
      socket.socket.removeListener('user', emitUser);
      socket.socket.removeListener('post', emitPost);
    };
  }, [propsPost?.id || propsPost]);

  // return posts
  const actualPost = {
    load   : loadPost,
    update : updatePost,
    delete : deletePost,

    post,
    loading,
  };

  // window
  window.NFTPost = actualPost;

  // return post
  return actualPost;
};

// export default
export default usePost;