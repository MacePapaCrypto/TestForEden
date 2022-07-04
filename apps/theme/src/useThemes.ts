
// import auth context
import { useAuth, useSocket } from '@moonup/ui';
import React, { useEffect, useState } from 'react';

// use auth hook
const useThemes = (props = {}) => {
  // socket
  const auth = useAuth();
  const socket = useSocket();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState('list');
  const [updated, setUpdated] = useState(new Date());

  // load
  const listThemes = async () => {
    // set loading
    setLoading('list');

    // loaded
    let loadedThemes = [];

    // try/catch
    try {
      // loaded
      loadedThemes = await socket.get('/theme/list', props);

      // themes
      for (let i = (themes.length - 1); i >= 0; i--) {
        // check if theme
        if (!loadedThemes.find((s) => s.id === themes[i].id)) {
          // removed
          themes.splice(i, 1);
        }
      }

      // replace all info
      loadedThemes.forEach((theme) => {
        // local
        const localTheme = themes.find((s) => s.id === theme.id);

        // check local theme
        if (!localTheme) return themes.push(theme);

        // update info
        Object.keys(theme).forEach((key) => {
          // theme key
          localTheme[key] = theme[key];
        });
      });

      // set themes
      setUpdated(new Date());
    } catch (e) {
      // loading
      setLoading(null);
      throw e;
    }

    // set loading
    setLoading(null);

    // return themes
    return loadedThemes;
  };
  
  // load from socket
  useEffect(() => {
    // load from socket
    listThemes();

    // on connect
    socket.socket.on('connect', listThemes);

    // done
    return () => {
      // off connect
      socket.socket.removeListener('connect', listThemes);
    };
  }, [auth?.account]);

  // return themes
  const MoonThemes = {
    list : listThemes,

    themes,
    loading,
    updated,
  };

  // return
  return MoonThemes;
};

// export default
export default useThemes;