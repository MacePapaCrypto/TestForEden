
// react
import apps from '../App';
import { Rnd } from 'react-rnd';
import { Box, Paper, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// local
import Bar from './Bar';
import useDesktop from '../useDesktop';

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
  const desktop = useDesktop();

  // ref
  const dragRef = useRef(null);
  const windowRef = useRef(null);

  // large grid size
  const largeGridSize = 20;

  // position
  const [ready, setReady] = useState(!!(props.item.position?.width));
  const [place, setPlace] = useState({
    x : 0,
    y : 0,

    width  : 240,
    height : 240,

    ...(props.item.position || {}),
  });

  // bring to front
  const bringToFront = () => {
    // bring to front
    props.bringToFront();
  };

  // save place
  const savePlace = useCallback(({ x, y, width, height }) => {
    // check placement
    const found = [['x', x], ['y', y], ['width', width], ['height', height]].find(([key, value]) => {
      return (props.item.position || {})[key] !== value;
    });
    
    // check found
    if (!found) return;

    // set place
    setPlace({ x, y, width, height });

    // save to db
    debounce(() => props.desktop.updateTask({
      id       : props.item.id,
      position : { x, y, width, height },
    }));
  }, [props.item?.id]);

  // use effect
  useEffect(() => {
    // check position
    if (props.item.position || !props.item.default?.width) return setReady(true);

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
    setReady(true);
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

  // check ready
  if (!ready) return null;

  // return jsx
  return (
    <Rnd
      ref={ dragRef }
      size={ { width : place.width, height : place.height } }
      style={ {
        zIndex : props.item.zIndex,
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

      disableDragging={ !props.canDrag }

      dragHandleClassName="window-handle"
    >
      <Paper sx={ {
        width         : '100%',
        height        : '100%',
        display       : 'flex',
        borderWidth   : theme.shape.borderWidth,
        borderStyle   : 'solid',
        borderColor   : desktop.activeTask === props.item.id ? theme.palette.border.active : theme.palette.border.primary,
        borderRadius  : 2,
        flexDirection : 'column',
      } } ref={ windowRef } elevation={ 2 } onMouseDown={ bringToFront }>
        <Bar
          item={ props.item }
          active={ desktop.activeTask === props.item.id }

          onMoveUp={ props.onMoveUp }
          onMoveDown={ props.onMoveDown }
        />
        <Box sx={ {
          flex     : 1,
          display  : 'flex',
          overflow : 'hidden',
          
          borderBottomLeftRadius  : 2,
          borderBottomRightRadius : 2,
        } }>
          <AppType item={ props.item } bringToFront={ props.bringToFront } />
        </Box>
      </Paper>
    </Rnd>
  );
};

// export default
export default MoonWindow;