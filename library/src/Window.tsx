
// react
import React, { useEffect, useState } from 'react';
import apps from './App';
import { Rnd } from 'react-rnd';
import { Box, useTheme } from '@mui/material';

// local
import WindowBar from './WindowBar';

// moon window
const MoonWindow = (props = {}) => {
  // use theme
  const theme = useTheme();

  // state
  const [leftDown, setLeftDown] = useState(false);
  const [rightDown, setRightDown] = useState(false);
  const [largeGrid, setLargeGrid] = useState(false);

  // large grid size
  const largeGridSize = 20;

  // position
  const [place, setPlace] = useState({
    x : 0,
    y : 0,

    width  : 240,
    height : 240,

    ...(props.item.position || {}),
  });

  // save place
  const savePlace = ({ x, y, width, height }) => {
    // set place
    setPlace({ x, y, width, height });

    // save to db
    props.desktop.updateTask({
      id       : props.item.id,
      position : { x, y, width, height },
    });
  };

  // check mouse down
  const onMouseDown = (e) => {
    // bring to front
    props.bringToFront();

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

  // app type
  const AppType = apps[props.item.type];

  // return jsx
  return (
    <Rnd
      size={ { width : place.width, height : place.height } }
      style={ {
        zIndex : props.zIndex,
      } }
      bounds="body"
      position={ { x : place.x, y : place.y } }
      onDragStop={ (e, d) => savePlace({
        ...place,

        x : d.x,
        y : d.y,
      }) }
      onResizeStop={ (e, direction, ref, delta, position) => savePlace({
        ...place,

        x : position.x,
        y : position.y,

        width  : ref.style.width,
        height : ref.style.height,
      }) }

      dragGrid={ largeGrid ? [largeGridSize, largeGridSize] : [1, 1] }
      resizeGrid={ largeGrid ? [largeGridSize, largeGridSize] : [1, 1] }

      onMouseUp={ onMouseUp }
      onMouseDown={ onMouseDown }
      onContextMenu={ (e) => e.preventDefault() }
    >
      <Box sx={ {
        width         : '100%',
        height        : '100%',
        border        : `.1rem solid ${props.item.active ? theme.palette.primary.main : theme.palette.grey[300]}`,
        display       : 'flex',
        transition    : 'all 0.2s ease',
        background    : theme.palette.background.paper,
        borderRadius  : `${theme.shape.borderRadius * 2}px`,
        flexDirection : 'column',
      } } onMouseDown={ onMouseDown } onMouseUp={ onMouseUp } onContextMenu={ (e) => e.preventDefault() }>
        <WindowBar active={ props.item.active } item={ props.item } />
        <Box sx={ {
          flex     : 1,
          display  : 'flex',
          overflow : 'hidden',
          
          borderBottomLeftRadius  : `${theme.shape.borderRadius * 2}px`,
          borderBottomRightRadius : `${theme.shape.borderRadius * 2}px`,
        } }>
          <AppType item={ props.item } />
        </Box>
      </Box>
    </Rnd>
  );
};

// export default
export default MoonWindow;