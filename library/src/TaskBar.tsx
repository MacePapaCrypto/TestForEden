
// import react
import { faBell, faMoon } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useRef, useState } from 'react';
import { Box, Stack, Paper, Button, useTheme } from '@mui/material';

// local
import Task from './Task';
import StartMenu from './StartMenu';
import useDesktop from './useDesktop';

// nft sidebar
const MoonTaskBar = (props = {}) => {
  // theme
  const theme = useTheme();
  const style = props.style || 'floating';
  const desktop = useDesktop();
  const position = props.position || 'bottom';
  const [startMenu, setStartMenu] = useState(false);

  // menu ref
  const startMenuRef = useRef(null);

  // widths
  const taskBarSize = parseInt(theme.spacing(8).replace('px', ''));
  const taskBarItemSize = parseInt(theme.spacing(6).replace('px', ''));

  // is vertical
  const isVertical = ['left', 'right'].includes(position);

  // bring to front
  const onBringToFront = (id) => {
    // bring task to front
    desktop.bringTaskToFront({ id });
  };

  // get tasks
  const getTasks = () => {
    // return sorted tasks
    return [...(desktop.tasks || [])].sort((a, b) => {
      // return a,b
      if (a.order > b.order) return 1;
      if (a.order < b.order) return -1;
      return 0;
    });
  };

  // return jsx
  return (
    <>
      <Box sx={ {
        width   : isVertical ? taskBarSize : (style === 'floating' ? `calc(100vw - ${theme.spacing(2)})` : '100vw'),
        height  : isVertical ? (style === 'floating' ? `calc(100vh - ${theme.spacing(2)})` : '100vh') : taskBarSize,
        margin  : style === 'floating' ? theme.spacing(1) : undefined,
        display : 'flex',
      } } ref={ startMenuRef }>
        <Paper sx={ {
          flex         : 1,
          display      : 'flex',
          borderRadius : style === 'fixed' ? undefined : 2,
        } } elevation={ 1 }>
          <Stack direction={ isVertical ? 'column' : 'row' } spacing={ 1 } sx={ {
            px             : isVertical ? undefined : theme.spacing(1),
            py             : isVertical ? theme.spacing(1) : undefined,
            flex           : 1,
            border         : style === 'floating' ? `${theme.shape.borderWidth} solid ${theme.palette.border.primary}` : undefined,
            alignItems     : isVertical ? undefined : 'center',
            borderRadius   : style === 'fixed' ? undefined : 2,
            justifyContent : isVertical ? 'center' : undefined,

            borderTop    : style === 'fixed' && position === 'bottom' ? `${theme.shape.borderWidth} solid ${theme.palette.border.primary}` : undefined,
            borderLeft   : style === 'fixed' && position === 'right' ? `${theme.shape.borderWidth} solid ${theme.palette.border.primary}` : undefined,
            borderRight  : style === 'fixed' && position === 'left' ? `${theme.shape.borderWidth} solid ${theme.palette.border.primary}` : undefined,
            borderBottom : style === 'fixed' && position === 'top' ? `${theme.shape.borderWidth} solid ${theme.palette.border.primary}` : undefined,
          } }>
            <Button sx={ {
              mx          : isVertical ? 'auto!important' : undefined,
              width       : `${taskBarItemSize}px`,
              color       : theme.palette.text.primary,
              height      : `${taskBarItemSize}px`,
              minWidth    : `${taskBarItemSize}px`,
              background  : 'transparent',
              borderWidth : theme.shape.borderWidth,
              borderColor : startMenu ? undefined : 'transparent',
            } } variant="outlined" color="primary" onClick={ (e) => setStartMenu(true) }>
              <FontAwesomeIcon icon={ faMoon } size="lg" />
            </Button>

            <Box
              mx={ isVertical ? 'auto!important' : undefined }
              width={ isVertical ? theme.spacing(4) : undefined }
              height={ isVertical ? undefined : theme.spacing(4) }
              borderTop={ isVertical ? `${theme.shape.borderWidth} solid ${theme.palette.border.primary}` : undefined }
              borderRight={ isVertical ? undefined : `${theme.shape.borderWidth} solid ${theme.palette.border.primary}` }
            />

            <Stack direction={ isVertical ? 'column' : 'row' } sx={ {
              px             : theme.spacing(1),
              flex           : 1,
              alignItems     : 'center',
              justifyContent : isVertical ? 'flex-start' : undefined,
            } }>
              { getTasks().map((task) => {
                // return jsx
                return (
                  <Task key={ `task-${task.id}` } item={ task } onBringToFront={ () => onBringToFront(task.id) } />
                );
              }) }
            </Stack>

            <Box
              mx={ isVertical ? 'auto!important' : undefined }
              width={ isVertical ? theme.spacing(4) : undefined }
              height={ isVertical ? undefined : theme.spacing(4) }
              borderTop={ isVertical ? `${theme.shape.borderWidth} solid ${theme.palette.border.primary}` : undefined }
              borderRight={ isVertical ? undefined : `${theme.shape.borderWidth} solid ${theme.palette.border.primary}` }
            />

            <Button sx={ {
              mx         : isVertical ? 'auto!important' : undefined,
              width      : `${taskBarItemSize}px`,
              color      : theme.palette.text.primary,
              height     : `${taskBarItemSize}px`,
              minWidth   : `${taskBarItemSize}px`,
              background : 'transparent',
            } } variant="text">
              <FontAwesomeIcon icon={ faBell } size="lg" />
            </Button>
          </Stack>
        </Paper>
      </Box>

      <StartMenu open={ !!startMenu } anchorEl={ startMenuRef.current } placement="top-start" onClose={ () => setStartMenu(false) } />
    </>
  );
};

// export default
export default MoonTaskBar;