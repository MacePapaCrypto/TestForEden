
// import react
import React from 'react';
import { Button, Tooltip, useTheme } from '@mui/material';

// use desktop
import useDesktop from './useDesktop';

/**
 * create moon task
 *
 * @param props 
 */
const MoonTask = (props = {}) => {
  // theme
  const theme = useTheme();
  const desktop = useDesktop();

  // widths
  const taskBarItemSize = parseInt(theme.spacing(6).replace('px', ''));

  // return jsx
  return (
    <Tooltip title={ props.item.name || '' } placement="top">
      <Button sx={ {
        px           : 1,
        width        : `${taskBarItemSize * 1.5}px`,
        color        : theme.palette.text.primary,
        height       : `${taskBarItemSize}px`,
        display      : 'block',
        minWidth     : `${taskBarItemSize}px`,
        overflow     : 'hidden',
        background   : 'transparent',
        whiteSpace   : 'nowrap',
        borderWidth  : `.1rem`,
        borderColor  : desktop.activeTask === props.item.id ? theme.palette.border.active : 'transparent',
        textOverflow : 'ellipsis',
      } } variant="outlined" onClick={ () => props.onBringToFront() }>
        { props.item.name }
      </Button>
    </Tooltip>
  );
};

// export default
export default MoonTask;