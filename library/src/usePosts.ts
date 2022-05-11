
// import auth post
import useId from './useId';
import moment from 'moment';
import useAuth from './useAuth';
import useSocket from './useSocket';
import React, { useState, useEffect } from 'react';

// use auth hook
const usePosts = (props = {}) => {
  // socket
  const uuid = useId();
  const auth = useAuth();
  const socket = useSocket();
  const [updated, setUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  
  // let posts
  let [posts, setPosts] = useState([]);

  // get post
  const getPost = async (id) => {
    // check found
    if (!id) return;

    // check found
    const found = posts.find((s) => s.id === id);

    // check found
    if (found) return found;

    // load
    const backendPost = await socket.get(`/post/${id}`);

    // return backend post
    return backendPost;
  };

  // replace or create
  const createOrReplace = (post) => {
    // check filter
    const filter = { ...props };

    // check post in context
    const filterThread = filter.thread;
    const filterAccount = filter.account;
    const filterContext = filter.context;
    const filterSegment = filter.segment;

    // filter
    if (!filterThread && !filterAccount && !filterContext && !filterSegment) return;
    
    // found post
    const foundPost = posts.find((p) => p.id === post.id || p.temp === post.temp || p.temp === post.id);

    // create or replace post
    if (!foundPost) {
      // post elements
      const postThread = post.thread?.id || post.thread;
      const postAccount = post.account?.id || post.account;
      const postContext = post.context?.id || post.context;
      const postSegment = post.segment?.id || post.segment;

      // check
      if (filterThread && (!postThread || (postThread !== filterThread))) {
        return;
      }
      if (filterAccount && (!postAccount || (postAccount !== filterAccount))) {
        return;
      }
      if (filterContext && (!postContext || (postContext !== filterContext))) {
        return;
      }
      if (filterSegment && (!postSegment || (postSegment !== filterSegment))) {
        return;
      }

      // check filter
      if (filter.feed === 'chat') {
        filter.dir = filter.dir || 'desc';
        filter.sort = filter.sort || 'createdAt';
      }

      // new posts
      posts = [post, ...posts].sort((a, b) => {
        // sorted
        if (!filter.dir || !filter.sort) return 0;

        // get field
        let filterA = a[filter.sort];
        let filterB = b[filter.sort];

        // check if date
        if (moment(filterA).isValid() && moment(filterB).isValid()) {
          filterA = new Date(filterA);
          filterB = new Date(filterB);
        }

        // return
        if (filterA > filterB) return filter.dir === 'asc' ? 1 : -1;
        if (filterB > filterA) return filter.dir === 'asc' ? -1 : 1;
        return 0;
      });

      // set posts
      setPosts(posts);
      return setUpdated(new Date());
    }

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

  // create
  const createPost = async ({
    thread = null,
    context = null,
    segment = null,
    content = '',

    withTemp = props.feed === 'chat',
  }) => {
    // set loading
    setLoading(true);

    // temp id
    const tempId = uuid();
    let loadedPost;
    let foundPost = {
      id      : tempId,
      temp    : tempId,
      status  : 'posting',
      account : auth.account ? auth.account.toLowerCase() : null,
      
      thread,
      content,
      context,
      segment,
    };

    // check with temp
    if (withTemp) {
      // create temp post
      createOrReplace(foundPost);
    }

    // try/catch
    try {
      // load
      loadedPost = await socket.post('/post', {
        temp : tempId,
        thread,
        segment,
        content,
        context,
      });

      // create or replace
      createOrReplace(loadedPost);
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

  // emit
  const emitPost = (post) => {
    // update post
    createOrReplace(post);
  };

  // emit user
  const emitUser = (emitUser) => {
    // has update
    let hasUpdate = false;

    // update post
    posts.forEach((post) => {
      // update user
      if (emitUser.id === post?.account) {
        // set user
        post.user = emitUser;

        // has update
        hasUpdate = true;
      }
    });

    // update
    if (hasUpdate) setUpdated(new Date());
  };

  // create
  const updatePost = async ({ id, content, ...data }, save = true) => {
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
    if (!save) {
      // update
      return setUpdated(new Date());
    } else {
      // update in place
      posts = [...posts];
      setPosts(posts);
    }

    // loaded
    let loadedPost;

    // try/catch
    try {
      // load
      loadedPost = await socket.patch(`/post/${id}`, {
        content,
      });

      // set posts
      createOrReplace(loadedPost);
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
    // set loading
    setLoading(id);

    // try/catch
    try {
      // load
      await socket.delete(`/post/${id}`);

      // set posts
      posts = posts.filter((p) => p.id !== id && p.temp !== id);
      setPosts(posts);
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

  // load
  const listPosts = async () => {
    // check filter
    const filter = { ...props };

    // check filter
    if (!filter.context && !filter.account && !filter.segment && !filter.thread) return;

    // set loading
    posts = [];
    setLoading(true);
    setPosts([]);

    // check filter
    if (props.feed === 'chat') {
      filter.dir = filter.dir || 'desc';
      filter.sort = filter.sort || 'createdAt';
    }

    // loaded
    let loadedPosts = [];

    // try/catch
    try {
      // loaded
      loadedPosts = await socket.get('/post', filter);

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
  
  // load from socket
  useEffect(() => {
    // load from socket
    listPosts();

    // remove old listener
    socket.socket.on('user', emitUser);
    socket.socket.on('post', emitPost);

    // done
    return () => {
      // off connect
      socket.socket.removeListener('user', emitUser);
      socket.socket.removeListener('post', emitPost);
    };
  }, [JSON.stringify(props)]);

  // return posts
  const actualPosts = {
    get    : getPost,
    list   : listPosts,
    update : updatePost,
    create : createPost,
    delete : deletePost,

    posts,
    updated,
    loading,
  };

  // nft feed
  window.NFTPosts = actualPosts;

  // return feed
  return actualPosts;
};

// export default
export default usePosts;