
// import react
import React from 'react';
import { faBell, faMoon } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Stack, Button, useTheme } from '@mui/material';

// local
import Task from './Task';
import useDesktop from './useDesktop';

// nft sidebar
const MoonTaskBar = (props = {}) => {
  // theme
  const theme = useTheme();
  const style = props.style || 'floating';
  const desktop = useDesktop();
  const position = props.position || 'bottom';

  // widths
  const taskBarSize = parseInt(theme.spacing(8).replace('px', ''));
  const taskBarItemSize = parseInt(theme.spacing(6).replace('px', ''));

  // is vertical
  const isVertical = ['left', 'right'].includes(position);

  // return jsx
  return (
    <>
      <Box sx={ {
        width   : isVertical ? taskBarSize : (style === 'floating' ? `calc(100vw - ${theme.spacing(2)})` : '100vw'),
        height  : isVertical ? (style === 'floating' ? `calc(100vh - ${theme.spacing(2)})` : '100vh') : taskBarSize,
        margin  : style === 'floating' ? theme.spacing(1) : undefined,
        display : 'flex',
      } }>
        <Stack direction={ isVertical ? 'column' : 'row' } spacing={ 1 } sx={ {
          px             : isVertical ? undefined : theme.spacing(1),
          py             : isVertical ? theme.spacing(1) : undefined,
          flex           : 1,
          border         : style === 'floating' ? `.1rem solid ${theme.palette.grey[300]}` : undefined,
          background     : theme.palette.background.paper,
          alignItems     : isVertical ? undefined : 'center',
          borderRadius   : style === 'fixed' ? undefined : `${theme.shape.borderRadius * 2}px`,
          justifyContent : isVertical ? 'center' : undefined,

          borderTop    : style === 'fixed' && position === 'bottom' ? `.1rem solid ${theme.palette.grey[300]}` : undefined,
          borderLeft   : style === 'fixed' && position === 'right' ? `.1rem solid ${theme.palette.grey[300]}` : undefined,
          borderRight  : style === 'fixed' && position === 'left' ? `.1rem solid ${theme.palette.grey[300]}` : undefined,
          borderBottom : style === 'fixed' && position === 'top' ? `.1rem solid ${theme.palette.grey[300]}` : undefined,
        } }>
          <Button sx={ {
            mx         : isVertical ? 'auto!important' : undefined,
            width      : `${taskBarItemSize}px`,
            color      : theme.palette.grey[300],
            height     : `${taskBarItemSize}px`,
            minWidth   : `${taskBarItemSize}px`,
            background : 'transparent',
          } } variant="text" color="primary">
            <FontAwesomeIcon icon={ faMoon } size="lg" />
          </Button>

          <Box
            mx={ isVertical ? 'auto!important' : undefined }
            width={ isVertical ? theme.spacing(4) : undefined }
            height={ isVertical ? undefined : theme.spacing(4) }
            borderTop={ isVertical ? `.1rem solid ${theme.palette.grey[300]}` : undefined }
            borderRight={ isVertical ? undefined : `.1rem solid ${theme.palette.grey[300]}` }
          />

          <Stack direction={ isVertical ? 'column' : 'row' } sx={ {
            px             : theme.spacing(1),
            flex           : 1,
            alignItems     : 'center',
            justifyContent : isVertical ? 'flex-start' : undefined,
          } }>
            { desktop.tasks.map((task) => {
              // return jsx
              return (
                <Task key={ `task-${task.id}` } item={ task } />
              );
            }) }
          </Stack>

          <Box
            mx={ isVertical ? 'auto!important' : undefined }
            width={ isVertical ? theme.spacing(4) : undefined }
            height={ isVertical ? undefined : theme.spacing(4) }
            borderTop={ isVertical ? `.1rem solid ${theme.palette.grey[300]}` : undefined }
            borderRight={ isVertical ? undefined : `.1rem solid ${theme.palette.grey[300]}` }
          />

          <Button sx={ {
            mx         : isVertical ? 'auto!important' : undefined,
            width      : `${taskBarItemSize}px`,
            color      : theme.palette.grey[300],
            height     : `${taskBarItemSize}px`,
            minWidth   : `${taskBarItemSize}px`,
            background : 'transparent',
          } } variant="text">
            <FontAwesomeIcon icon={ faBell } size="lg" />
          </Button>
        </Stack>
      </Box>
    </>
  );
};

// export default
export default MoonTaskBar;