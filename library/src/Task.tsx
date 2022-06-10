
// import react
import React from 'react';
import { Button, useTheme } from '@mui/material';

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
    <Button sx={ {
      width      : `${taskBarItemSize}px`,
      color      : theme.palette.grey[300],
      height     : `${taskBarItemSize}px`,
      minWidth   : `${taskBarItemSize}px`,
      background : 'transparent',
    } } variant="text">
      { props.item.name }
    </Button>
  );
};

// export default
export default MoonTask;