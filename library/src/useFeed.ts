
// import auth post
import usePosts from './usePosts';
import useSocket from './useSocket';
import React, { useState, useEffect } from 'react';

// use auth hook
const useFeed = (props = {}) => {
  // post
  const post = usePosts();

  // socket
  const socket = useSocket();
  const [updated, setUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  
  // let posts
  let [posts, setPosts] = useState([]);

  // emit
  const emitPost = (post) => {
    // found post
    const foundPost = posts.find((p) => p.id === post.id || p.temp === post.temp || p.temp === post.id);

    // create or replace post
    if (!foundPost) return;

    // changed
    let changed = false;

    // find
    Object.keys(post).forEach((key) => {
      // check
      if (JSON.stringify(foundPost[key]) !== JSON.stringify(post[key])) changed = true;

      // update
      foundPost[key] = post[key];
    });

    // set posts
    if (changed) {
      posts = [...posts];
      setPosts(posts);
      setUpdated(new Date());
    }
  };

  // load
  const listPosts = async () => {
    // check filter
    const filter = { ...props };

    // set posts
    posts = [];
    setPosts([]);

    // check feed
    if (!filter.feed) return;

    // loading
    setLoading(true);

    // loaded
    let loadedPosts = [];

    // try/catch
    try {
      // loaded
      loadedPosts = await socket.get(`/feed/${filter.feed}`, filter);

      // set posts
      posts = loadedPosts;
      setPosts(posts);
      setUpdated(new Date());
    } catch (e) {
      // loading
      setLoading(false);
      throw e;
    }

    // set loading
    setLoading(false);

    // return posts
    return loadedPosts;
  };

  // create
  const createPost = async (...args) => {
    // set loading
    setLoading(true);

    // create in post
    const actualPost = await post.create(...args);

    // push
    if (!posts.find((p) => p.id === actualPost.id)) posts.unshift(actualPost);

    // update
    posts = [...posts];
    setPosts(posts);
    setUpdated(new Date());
    setLoading(false);
  };
  
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

  // return posts
  return {
    ...post,
    create : createPost,

    posts,
    updated,
    loading,
  };
};

// export default
export default useFeed;