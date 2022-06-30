
// socketio client
import React, { useEffect, useState } from 'react';
import deepmerge from 'deepmerge';
import mainTheme from './index';
import { createTheme, ThemeProvider } from '@mui/material';

// theme emitter
import useAuth from '../useAuth';
import useSocket from '../useSocket';
import ThemeEmitter from './Emitter';
import ThemeContext from './Context';

// socket context
const MoonThemeProvider = (props = {}) => {
  // updated
  const [theme, setTheme] = useState(null);
  const [updated, setUpdated] = useState(new Date());

  // socket/auth
  const auth = useAuth();
  const socket = useSocket();

  // create emitter
  const [emitter] = useState(() => {
    // return emitter
    return window.themeEmitter || new ThemeEmitter({
      auth,
      socket,
    });
  });

  // use effect
  useEffect(() => {
    // real theme
    const realTheme = deepmerge((mainTheme || {}), (emitter.state?.theme?.theme || {}));

    console.log('real theme', realTheme);

    // check theme
    setTheme(createTheme(realTheme));
  }, [JSON.stringify(emitter.state?.theme?.theme)]);

  // use effect
  useEffect(() => {
    // check emitter
    if (!emitter) return;
    
    // on updated
    const onUpdated = () => setUpdated(new Date());

    // add listener
    emitter.on('updated', onUpdated);

    // return done
    return () => {
      // remove listener
      emitter.removeListener('updated', onUpdated);
    };
  }, [emitter]);

  // use effect
  useEffect(() => {
    // do props
    emitter.props({
      auth,
      socket,
    });
  }, [auth?.account]);

  // main theme
  const actualTheme = theme || createTheme(mainTheme);

  // moon theme
  window.MoonTheme  = actualTheme;
  window.MoonThemes = emitter?.state;

  // return jsx
  return (
    <ThemeProvider theme={ actualTheme }>
      <ThemeContext.Provider value={ emitter?.state }>
        { props.children }
      </ThemeContext.Provider>
    </ThemeProvider>
  );
};

// export default
export default MoonThemeProvider;