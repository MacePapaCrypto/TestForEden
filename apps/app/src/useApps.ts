
// import auth context
import { useAuth, useSocket } from '@moonup/ui';
import React, { useEffect, useState } from 'react';

// use auth hook
const useApps = (props = {}) => {
  // socket
  const auth = useAuth();
  const socket = useSocket();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState('list');
  const [updated, setUpdated] = useState(new Date());

  // load
  const listApps = async () => {
    // set loading
    setLoading('list');

    // loaded
    let loadedApps = [];

    // try/catch
    try {
      // loaded
      loadedApps = await socket.get('/app/list', props);

      // apps
      for (let i = (apps.length - 1); i >= 0; i--) {
        // check if app
        if (!loadedApps.find((s) => s.id === apps[i].id)) {
          // removed
          apps.splice(i, 1);
        }
      }

      // replace all info
      loadedApps.forEach((app) => {
        // local
        const localApp = apps.find((s) => s.id === app.id);

        // check local app
        if (!localApp) return apps.push(app);

        // update info
        Object.keys(app).forEach((key) => {
          // app key
          localApp[key] = app[key];
        });
      });

      // set apps
      setUpdated(new Date());
    } catch (e) {
      // loading
      setLoading(null);
      throw e;
    }

    // set loading
    setLoading(null);

    // return apps
    return loadedApps;
  };
  
  // load from socket
  useEffect(() => {
    // load from socket
    listApps();

    // on connect
    socket.socket.on('connect', listApps);

    // done
    return () => {
      // off connect
      socket.socket.removeListener('connect', listApps);
    };
  }, [auth?.account]);

  // return apps
  const MoonApps = {
    list : listApps,

    apps,
    loading,
    updated,
  };

  // return
  return MoonApps;
};

// export default
export default useApps;