
// import auth post
import usePosts from './usePosts';
import useSocket from './useSocket';
import React, { useState, useEffect, useCallback } from 'react';

// use auth hook
const useFeed = (props = {}) => {
  // post
  const post = usePosts();

  // socket
  const socket = useSocket();
  const [updated, setUpdated] = useState(new Date());
  const [loading, setLoading] = useState(null);
  
  // let posts
  const [posts, setPosts] = useState([]);

  // load
  const listPosts = useCallback(async () => {
    // check filter
    const filter = { ...props };

    // set loading
    setLoading('list');

    // loaded
    let loadedPosts = [];

    // try/catch
    try {
      // loaded
      loadedPosts = await socket.get(`/feed/${filter.feed}`, filter);

      // tasks
      for (let i = (posts.length - 1); i >= 0; i--) {
        // check if task
        if (!loadedPosts.find((s) => s.id === posts[i].id)) {
          // removed
          posts.splice(i, 1);
        }
      }

      // replace all info
      loadedPosts.forEach((post) => {
        // local
        const localPost = posts.find((s) => s.id === post.id);

        // check local task
        if (!localPost) return posts.push(post);

        // update info
        Object.keys(post).forEach((key) => {
          // task key
          localPost[key] = post[key];
        });
      });

      // set tasks
      setUpdated(new Date());
    } catch (e) {
      // loading
      setLoading(null);
      throw e;
    }

    // set loading
    setLoading(null);

    // return tasks
    return loadedPosts;
  }, [props]);

  // create
  const createPost = useCallback(async (...args) => {
    // set loading
    setLoading('create');

    // create in post
    const createdPost = await post.create(...args);

    // emit post
    emitPost(createdPost);
    setLoading(null);

    // return
    return createdPost;
  }, []);

  // create
  const updatePost = useCallback(async (updatePost, save = true) => {
    // find post
    let foundPost = posts.find((post) => post.id === updatePost.id || post.temp === updatePost.temp);

    // check found
    if (foundPost) {
      // loop keys
      Object.keys(updatePost).forEach((key) => foundPost[key] = updatePost[key]);
    } else {
      // adding new
      foundPost = updatePost;

      // push
      posts.push(updatePost);
    }

    // check save
    if (!save) {
      // updated
      setUpdated(new Date());

      // return update
      return foundPost;
    }

    // set loading
    setLoading('update');

    // create in post
    const updatedPost = await post.update(updatePost);

    // emit post
    emitPost(updatedPost);
    setLoading(null);

    // return
    return updatedPost;
  }, []);
  
  // load from socket
  useEffect(() => {
    // load from socket
    listPosts();

    // remove old listener
    socket.socket.on('post', emitPost);

    // done
    return () => {
      // off connect
      socket.socket.removeListener('post', emitPost);
    };
  }, [JSON.stringify(props)]);

  // emit
  const emitPost = useCallback((task, isRemove = false) => {
    // remove
    if (isRemove) {
      // tasks
      for (let i = (posts.length - 1); i >= 0; i--) {
        // check if task
        if (task.id === posts[i].id) {
          // removed
          posts.splice(i, 1);
        }
      }

      // update
      setUpdated(new Date());
    } else {
      // update
      updatePost(task, false);
    }
  }, []);

  // emit task remove
  const emitPostRemove = (task) => emitPost(task, true);

  // return posts
  const MoonFeed = {
    ...post,
    create : createPost,
    update : updatePost,

    posts,
    updated,
    loading,
  };

  // nft feed
  window.MoonFeed = MoonFeed;

  // return feed
  return MoonFeed;
};

// export default
export default useFeed;