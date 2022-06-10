
import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

// window
import Window from './Window';
import useDesktop from './useDesktop';
import DesktopShortcut from './DesktopShortcut';

/**
 * moon desktop
 *
 * @param props 
 */
const MoonDesktop = (props = {}) => {
  // tasks
  const theme = useTheme();
  const desktop = useDesktop();

  // bring to front
  const onBringToFront = (id) => {
    // get window
    const item = desktop.tasks.find((item) => item.id === id);

    // for each
    desktop.tasks.forEach((item) => item.active = false);

    // remove all
    item.active = true;
    item.zIndex = desktop.tasks.length + 1;

    // sort
    desktop.tasks.sort((a, b) => {
      // indexing
      if (a.zIndex > b.zIndex) return 1;
      if (a.zIndex < b.zIndex) return -1;
      return 0;
    }).forEach((item, i) => {
      // set z index
      item.zIndex = i + 1;
    });

    // update
    desktop.updateTasks();
  };

  // return jsx
  return (
    <Box sx={ {
      flex       : 1,
      width      : '100%',
      height     : '100%',
      display    : 'flex',
      overflow   : 'hidden',
      alignItems : 'center',

      backgroundSize     : `20px 20px`,
      backgroundImage    : `radial-gradient(rgba(255,255,255,0.25) 0.5px, transparent 0.5px), radial-gradient(rgba(255,255,255,0.25) 0.5px, transparent 0.5px)`,
      backgroundPosition : `0 0,10px 10px`,
    } }>
      <Box sx={ {
        mx             : 'auto',
        px             : 4,
        py             : 2,
        display        : 'flex',
        alignItems     : 'center',
        background     : theme.palette.background.default,
        justifyContent : 'center',
      } }>
        <Typography variant="h2">
          WELCOME TO MOON
        </Typography>
      </Box>

      { desktop.shortcuts.map((item, i) => {
        // return window
        return (
          <DesktopShortcut key={ `shortcut-${item.id}` } item={ item } />
        )
      }) }
      { desktop.tasks.map((item, i) => {
        // return window
        return (
          <Window key={ `window-${item.id}` } item={ item } desktop={ desktop } zIndex={ item.zIndex } bringToFront={ () => onBringToFront(item.id) } />
        )
      }) }
    </Box>
  );
};

// export default
export default MoonDesktop;