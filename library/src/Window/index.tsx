
// react
import { Rnd } from 'react-rnd';
import { ErrorBoundary } from 'react-error-boundary';
import { Box, CircularProgress, Paper, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// font awesome icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/pro-regular-svg-icons';

// local
import Bar from './Bar';
import useApp from '../useApp';
import Context from './Context';
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
  const app = useApp(props.item.application, props.item.path);
  const theme = useTheme();
  const desktop = useDesktop();

  // ref
  const dragRef = useRef(null);
  const windowRef = useRef(null);

  // position
  const [place, setPlace] = useState({
    x : 0,
    y : 0,

    width  : 240,
    height : 240,

    ...(props.item.position || {}),
  });
  const [placed, setPlaced] = useState(props.item.position?.width);

  // bring to front
  const bringToFront = () => {
    // bring to front
    props.bringToFront();
  };

  // save place
  const savePlace = useCallback(({ x, y, width, height }) => {
    // check placement
    const found = [['x', x], ['y', y], ['width', width], ['height', height]].find(([key, value]) => {
      return (place || {})[key] !== value;
    });
    
    // check found
    if (!found) return;

    // set place
    setPlace({ x, y, width, height });
    setPlaced(true);

    // set position
    props.item.position = { x, y, width, height };

    // save to db
    debounce(() => props.desktop.updateTask({
      id       : props.item.id,
      position : { x, y, width, height },
    }));
  }, [props.item?.id]);

  // set path
  const setPath = useCallback((path) => {
    // set path on desktop
    desktop.updateTask({
      id : props.item?.id,
      path,
    });
  }, [props.item?.id]);

  // set path
  const pushPath = useCallback((path) => {
    // set path on desktop
    desktop.pushTaskPath({
      id : props.item?.id,
      path,
    });
  }, [props.item?.id]);

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

  // window body
  const windowBody = (
    <Paper sx={ {
      width         : '100%',
      height        : '100%',
      display       : 'flex',
      borderWidth   : props.isElectron ? 0 : theme.shape.borderWidth,
      borderStyle   : 'solid',
      borderColor   : desktop.activeTask === props.item.id ? theme.palette.border.active : theme.palette.border.primary,
      borderRadius  : 2,
      flexDirection : 'column',
    } } ref={ windowRef } elevation={ 2 } onMouseDown={ bringToFront }>
      { app.loading ? (
        <>
          <Bar
            name={ `Loading ${props.item.application?.name}` }
            active={ desktop.activeTask === props.item.id }

            onDelete={ () => desktop.deleteTask(props.item) }
            onMoveUp={ props.onMoveUp }
            isElectron={ props.isElectron }
            onMoveDown={ props.onMoveDown }
          />
          <Box flex={ 1 } display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        </>
      ) : (
        <ErrorBoundary FallbackComponent={ (
          <Box flex={ 1 } display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <FontAwesomeIcon icon={ faExclamationTriangle } size="xl" />
          </Box>
        ) }>
          { app.App ? (
            <Context.Provider value={ {
              item       : props.item,
              path       : props.item.path,
              onMoveUp   : props.onMoveUp,
              isElectron : props.isElectron,
              onMoveDown : props.onMoveDown,

              // save place
              place,
              placed,
              setPlace : savePlace,

              // pathing
              setPath,
              pushPath,
            } }>
              <app.App
                app={ props.item.application }
                path={ props.item.path }
                
                setPath={ setPath }
                pushPath={ pushPath }
              />
            </Context.Provider>
          ) : (
            <Box flex={ 1 } display="flex" flexDirection="column" alignItems="center" justifyContent="center">
              App Removed
            </Box>
          ) }
        </ErrorBoundary>
      ) }
    </Paper>
  );

  // check position
  if (props.isElectron) return windowBody;

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
      { windowBody }
    </Rnd>
  );
};

// export default
export default MoonWindow;