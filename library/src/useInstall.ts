
// import auth post
import useAuth from './useAuth';
import useSocket from './useSocket';
import useDesktop from './useDesktop';
import React, { useState, useEffect } from 'react';

// use auth hook
const useInstall = (subject) => {
  // socket
  const auth = useAuth();
  const socket = useSocket();
  const desktop = useDesktop();

  // auth
  const [install, setInstall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [installs, setInstalls] = useState(subject?.count?.installs || 0);

  // get post
  const loadInstall = async (id = null) => {
    // check found
    if (!id) id = subject?.id || subject;

    // check id
    if (!id) return;

    // check auth
    if (!auth.account) return;

    // loading
    setLoading(true);

    // load
    const backendInstall = await socket.get(`/install/${id}`);

    // set post
    setInstall(backendInstall);
    setLoading(false);

    // return backend post
    return backendInstall;
  };

  // add install
  const addInstall = async () => {
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
      count   : backendCount,
      install : backendInstall,
    } = await socket.post(`/install/${id}`);

    // create app
    await desktop.findOrCreateTask({
      app  : id,
      path : '/',
    });

    // set post
    setInstall(backendInstall);
    setInstalls(backendCount);
    setLoading(false);

    // return backend post
    return backendInstall;
  };

  // remove install
  const removeInstall = async () => {
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
    } = await socket.delete(`/install/${id}`);

    // set post
    setInstall(null);
    setInstalls(backendCount);
    setLoading(false);

    // return backend post
    return true;
  };

  // emit user
  const emitInstall = (install, count) => {
    // check found
    const id = subject?.id || subject;

    // update post
    if (install.from === id) {
      // update
      setInstall(install);
      setInstalls(count);
    }
  };

  // use effect
  useEffect(() => {
    // check loading
    if (auth.loading) return;
    
    // check found
    const id = subject?.id || subject;

    // update
    if (!id) return;

    // reset counts
    setInstalls(subject?.count?.installs || 0);

    // load install
    loadInstall();

    // add listener
    socket.socket.on('install', emitInstall);

    // done
    return () => {
      // off
      socket.socket.removeListener('install', emitInstall);
    };
  }, [subject?.id || subject, auth.loading]);

  // return posts
  const MoonInstall = {
    load   : loadInstall,
    create : addInstall,
    remove : removeInstall,

    install,
    loading,
    installs,
  };

  // window
  window.MoonInstall = MoonInstall;

  // return post
  return MoonInstall;
};

// export default
export default useInstall;