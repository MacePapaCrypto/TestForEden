
import React from 'react';
import { Box, Stack, Button, useTheme } from '@mui/material';

// font awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightAndArrowDownLeftFromCenter, faTimes } from '@fortawesome/pro-regular-svg-icons';

// local
import useDesktop from '../useDesktop';

// create component
const MoonWindowBar = (props = {}) => {
  // theme
  const theme = useTheme();
  const desktop = useDesktop();

  // widths
  const windowBarSize = parseInt(theme.spacing(6).replace('px', ''));
  const windowBarItemSize = parseInt(theme.spacing(4).replace('px', ''));

  // return jsx
  return (
    <Box sx={ {
      width   : '100%',
      height  : windowBarSize,
      display : 'flex',
    } }>
      <Stack direction="row" spacing={ 1 } sx={ {
        px         : theme.spacing(1),
        flex       : 1,
        alignItems : 'center',

        borderBottomStyle : 'solid',
        borderBottomWidth : theme.shape.borderWidth,
        borderBottomColor : props.active ? theme.palette.border.active : theme.palette.border.primary,
      } }>
        <Button sx={ {
          width      : `${windowBarItemSize}px`,
          color      : theme.palette.text.primary,
          height     : `${windowBarItemSize}px`,
          minWidth   : `${windowBarItemSize}px`,
          background : 'transparent',
        } } variant="text" onClick={ () => desktop.deleteTask(props.item) }>
          <FontAwesomeIcon icon={ faTimes } />
        </Button>

        <Box height={ theme.spacing(3) } borderRight={ `${theme.shape.borderWidth} solid ${props.active ? theme.palette.border.active : theme.palette.border.primary}` } />

        <Stack direction="row" sx={ {
          px             : theme.spacing(1),
          flex           : 1,
          cursor         : 'move',
          height         : '100%',
          textAlign      : 'center',
          alignItems     : 'center',
          justifyContent : 'center',
        } } className="window-handle" onMouseDown={ props.onMoveDown } onMouseUp={ props.onMoveUp } onContextMenu={ (e) => e.preventDefault() }>
          { props.item.name }
        </Stack>

        <Box height={ theme.spacing(3) } borderRight={ `${theme.shape.borderWidth} solid ${props.active ? theme.palette.border.active : theme.palette.border.primary}` } />

        <Button sx={ {
          width      : `${windowBarItemSize}px`,
          color      : theme.palette.text.primary,
          height     : `${windowBarItemSize}px`,
          minWidth   : `${windowBarItemSize}px`,
          background : 'transparent',
        } } variant="text">
          <FontAwesomeIcon icon={ faArrowUpRightAndArrowDownLeftFromCenter } />
        </Button>
      </Stack>
    </Box>
  );
};

// moon window bar
export default MoonWindowBar;