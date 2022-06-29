
import React, { useState } from 'react';
import { Box, Stack, Button, useTheme } from '@mui/material';

// font awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmarkLarge, faSquare, faWindowMinimize } from '@fortawesome/pro-regular-svg-icons';

// create component
const MoonWindowBar = (props = {}) => {
  // theme
  const theme = useTheme();

  // widths
  const windowBarSize = parseInt(theme.spacing(4).replace('px', ''));
  const windowBarItemSize = parseInt(theme.spacing(3).replace('px', ''));

  // return jsx
  return (
    <Box sx={ {
      width   : '100%',
      height  : windowBarSize,
      display : 'flex',
    } }>
      <Stack direction="row" spacing={ 0.5 } sx={ {
        px         : theme.spacing(1),
        flex       : 1,
        alignItems : 'center',

        borderBottomStyle : 'solid',
        borderBottomWidth : theme.shape.borderWidth,
        borderBottomColor : theme.palette.border.primary,
      } }>

        <Stack direction="row" sx={ {
          px             : theme.spacing(1),
          flex           : 1,
          cursor         : 'grab',
          height         : '100%',
          alignItems     : 'center',
          justifyContent : 'start',

          '&:active' : {
            cursor : 'grabbing',
          },
          '&:focus' : {
            cursor : 'grabbing',
          }
        } } className="window-handle" onMouseDown={ props.onMoveDown } onMouseUp={ props.onMoveUp } onContextMenu={ (e) => e.preventDefault() }>
          { props.name }
        </Stack>

        <Button sx={ {
          color      : theme.palette.text.primary,
          height     : `${windowBarItemSize}px`,
          minWidth   : `${windowBarItemSize}px`,
          background : 'transparent',
        } } variant="text" onClick={ () => props.onDelete() }>
          <FontAwesomeIcon icon={ faWindowMinimize } size="sm" fixedWidth />
        </Button>
        <Button sx={ {
          color      : theme.palette.text.primary,
          height     : `${windowBarItemSize}px`,
          minWidth   : `${windowBarItemSize}px`,
          background : 'transparent',
        } } variant="text">
          <FontAwesomeIcon icon={ faSquare } size="sm" fixedWidth />
        </Button>
        <Button sx={ {
          color      : theme.palette.text.primary,
          height     : `${windowBarItemSize}px`,
          minWidth   : `${windowBarItemSize}px`,
          background : 'transparent',
        } } variant="text" onClick={ () => props.onDelete() }>
          <FontAwesomeIcon icon={ faXmarkLarge } size="sm" fixedWidth />
        </Button>
      </Stack>
    </Box>
  );
};

// moon window bar
export default MoonWindowBar;