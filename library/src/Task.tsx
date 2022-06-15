
// import react
import React from 'react';
import { Button, Tooltip, useTheme } from '@mui/material';

/**
 * create moon task
 *
 * @param props 
 */
const MoonTask = (props = {}) => {
  // theme
  const theme = useTheme();

  // widths
  const taskBarItemSize = parseInt(theme.spacing(6).replace('px', ''));

  // return jsx
  return (
    <Tooltip title={ props.item.name } placement="top">
      <Button sx={ {
        px           : 1,
        width        : `${taskBarItemSize * 1.5}px`,
        color        : props.item.active ? undefined : theme.palette.grey[300],
        height       : `${taskBarItemSize}px`,
        display      : 'block',
        minWidth     : `${taskBarItemSize}px`,
        overflow     : 'hidden',
        background   : 'transparent',
        whiteSpace   : 'nowrap',
        borderWidth  : `.1rem`,
        borderColor  : props.item.active ? undefined : 'transparent',
        textOverflow : 'ellipsis',
      } } variant="outlined" onClick={ () => props.onBringToFront() }>
        { props.item.name }
      </Button>
    </Tooltip>
  );
};

// export default
export default MoonTask;