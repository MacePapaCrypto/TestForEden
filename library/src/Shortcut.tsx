
import { Rnd } from 'react-rnd';
import React, { useState, useEffect } from 'react';
import { Box, useTheme, Tooltip, ClickAwayListener } from '@mui/material';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon } from '@fortawesome/pro-regular-svg-icons';

/**
 * moon desktop shortcut
 *
 * @param props 
 */
const MoonDesktopShortcut = (props = {}) => {
  // use theme
  const theme = useTheme();

  // state
  const [active, setActive] = useState(false);
  const [leftDown, setLeftDown] = useState(false);
  const [rightDown, setRightDown] = useState(false);
  const [largeGrid, setLargeGrid] = useState(false);

  // large grid size
  const shortcutSize = 80;
  const largeGridSize = 20;

  // position
  const [place, setPlace] = useState({
    x : 0,
    y : 0,

    width  : shortcutSize,
    height : shortcutSize,
  });

  // check mouse down
  const onMouseDown = (e) => {
    // set down
    if (e.button === 0) {
      setLeftDown(true);
    } else if (e.button === 2) {
      setRightDown(true);
    }
  };

  // on mouse up
  const onMouseUp = (e) => {
    // set down
    if (e.button === 0) {
      setLeftDown(false);
    } else if (e.button === 2) {
      setRightDown(false);
    }
  };

  // use effect
  useEffect(() => {
    // set
    if (leftDown && rightDown) {
      setLargeGrid(true);
    } else {
      setTimeout(() => setLargeGrid(false), 200);
    }
  }, [leftDown, rightDown]);

  // const body
  const body = (
    <ClickAwayListener onClickAway={ () => setActive(false) }>
      <Tooltip title={ props.item.name || 'N/A' }>
        <Box sx={ {
          flex          : 1,
          width         : shortcutSize,
          height        : shortcutSize,
          cursor        : 'pointer',
          border        : active ? `.1rem solid ${theme.palette.border.primary}` : `.1rem solid rgba(255, 255, 255, 0)`,
          display       : 'flex',
          maxWidth      : shortcutSize,
          maxHeight     : shortcutSize,
          background    : active ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0)',
          borderRadius  : `${theme.shape.borderRadius}px`,
          flexDirection : 'column',

          '&:hover' : {
            border     : active ? `.1rem solid ${theme.palette.border.primary}` : `.1rem solid rgba(255, 255, 255, 0.25)`,
            background : active ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.125)',
          }
        } } onClick={ (e) => active ? props.onClick(e) : setActive(true) }>
          <Box flex={ 1 } alignItems="center" justifyContent="center" display="flex">
            <FontAwesomeIcon icon={ faMoon } size="2x" />
          </Box>
          <Box px={ 1 } flex={ 0 } width="100%">
            <Box textAlign="center" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
              { props.item.name || 'N/A' }
            </Box>
          </Box>
        </Box>
      </Tooltip>
    </ClickAwayListener>
  );

  // disable dragging
  if (props.disableDragging) return body;

  // return jsx
  return (
    <Rnd
      size={ { width : place.width, height : place.height } }
      bounds="parent"
      position={ { x : place.x, y : place.y } }
      onDragStop={ (e, d) => setPlace({
        ...place,

        x : d.x,
        y : d.y,
      }) }

      dragGrid={ largeGrid ? [largeGridSize, largeGridSize] : [1, 1] }

      onMouseUp={ onMouseUp }
      onMouseDown={ onMouseDown }

      enableResizing={ false }
    >
      { body }
    </Rnd>
  );
};

// export default
export default MoonDesktopShortcut;