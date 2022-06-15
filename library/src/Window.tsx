
// react
import React, { useEffect, useRef, useState } from 'react';
import apps from './App';
import { Rnd } from 'react-rnd';
import { Box, useTheme } from '@mui/material';

// local
import WindowBar from './WindowBar';

// debounce
let timeout;
const debounce = (fn, to = 500) => {
  // clear timeout
  clearTimeout(timeout);
  timeout = setTimeout(fn, to);
};

// moon window
const MoonWindow = (props = {}) => {
  // use theme
  const theme = useTheme();

  // state
  const [leftDown, setLeftDown] = useState(false);
  const [rightDown, setRightDown] = useState(false);
  const [largeGrid, setLargeGrid] = useState(false);

  // ref
  const dragRef = useRef(null);
  const windowRef = useRef(null);

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
    debounce(() => props.desktop.updateTask({
      id       : props.item.id,
      position : { x, y, width, height },
    }));
  };

  // on mouse down
  useEffect(() => {
    // check current
    if (!windowRef.current) return;

    // done
    const bringToFront = (e) => {
      props.bringToFront();
    };

    // add event listener
    windowRef.current.addEventListener('mousedown', bringToFront);

    // return done
    return () => {
      // add event listener
      windowRef.current?.removeEventListener('mousedown', bringToFront);
    };
  }, [windowRef?.current]);

  // use effect
  useEffect(() => {
    // check position
    if (props.item.position || !props.item.default?.width) return;

    // set default size
    const maxWidth = theme.breakpoints.values.xl;

    // check window size
    const windowWidth = window.innerWidth;
    const actualWidth = windowWidth > maxWidth ? maxWidth : windowWidth;

    // left size
    const leftSize = (windowWidth - actualWidth) / 2;

    // set actual position
    const newPosition = {
      width  : (actualWidth * props.item.default.width) - (props.item.default.x === 0 ? largeGridSize : 0),
      height : (document.getElementById('desktop').clientHeight * props.item.default.height) - (props.item.default.y === 0 ? (largeGridSize * 2) : largeGridSize),

      x : leftSize + (actualWidth * props.item.default.x),
      y : props.item.default.y === 0 ? largeGridSize : (document.getElementById('desktop').clientHeight * props.item.default.y),
    };

    // log
    setPlace({
      ...place,
      ...newPosition,
    });
  }, [props.item.position]);

  // use effect
  useEffect(() => {
    // check position
    if (!props.position) return;

    // new place
    const newPlace = {
      ...place,
      ...(props.position),
    };

    // new position
    savePlace(newPlace);
  }, [props.position]);

  // app type
  const AppType = apps[props.item.type];

  // return jsx
  return (
    <Rnd
      ref={ dragRef }
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
      disableDragging={ !props.canDrag }

      dragHandleClassName="window-handle"
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
      } } ref={ windowRef }>
        <WindowBar
          item={ props.item }
          active={ props.item.active }

          onMoveUp={ props.onMoveUp }
          onMoveDown={ props.onMoveDown }
        />
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