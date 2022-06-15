
import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

// window
import Window from './Window';
import useDesktop from './useDesktop';
import DesktopShortcut from './DesktopShortcut';

/**
 * moon desktop
 *
 * @param props 
 */
const MoonDesktop = (props = {}) => {
  // tasks
  const theme = useTheme();
  const desktop = useDesktop();

  // state
  const [XY, setXY] = useState([0, 0]);
  const [HW, setHW] = useState([0, 0]);
  const [place, setPlace] = useState(null);
  const [useGrid, setUseGrid] = useState(false);
  const [resizing, setResizing] = useState(null);
  const [leftDown, setLeftDown] = useState(false);
  const [rightDown, setRightDown] = useState(false);

  // grid size
  const [gridSize, setGridSize] = useState([20, 12]);

  // bring to front
  const onBringToFront = (id) => {
    // get window
    const item = desktop.tasks.find((item) => item.id === id);

    // check already active
    if (item.active) return;

    // for each
    desktop.tasks.forEach((item) => item.active = false);

    // remove all
    item.active = true;
    item.zIndex = desktop.tasks.length + 1;

    // sort
    desktop.tasks.sort((a, b) => {
      // indexing
      if (a.zIndex > b.zIndex) return 1;
      if (a.zIndex < b.zIndex) return -1;
      return 0;
    }).forEach((item, i) => {
      // set z index
      item.zIndex = i + 1;
    });

    // update
    desktop.updateTasks();
  };

  // check mouse down
  const onMoveDown = (item, e) => {
    // set resizing
    setResizing(item);

    // set down
    if (e.button === 0) {
      // left down
      setLeftDown(true);
      
      // if right down
      if (rightDown) {
        // set menu
        setUseGrid(true);
      }
    } else if (e.button === 2) {
      // right down
      setRightDown(true);
      
      // if right down
      if (leftDown) {
        // set menu
        setUseGrid(true);
      }
    }
  };

  // includes size
  const includesSize = (row, col) => {
    // true xy
    const trueXY = [(XY[0] < HW[0] ? XY[0] : HW[0]), (XY[1] < HW[1] ? XY[1] : HW[1])];
    const trueHW = [(XY[0] > HW[0] ? XY[0] : HW[0]), (XY[1] > HW[1] ? XY[1] : HW[1])];

    // return jsx
    return (row >= trueXY[0] && row <= trueHW[0]) && (col >= trueXY[1] && col <= trueHW[1]);
  };

  // on mouse up
  const onMoveUp = (item, e) => {
    // set down
    if (e.button === 0) {
      setPlace(null);
      setUseGrid(false);
      setLeftDown(false);
    } else if (e.button === 2) {
      setRightDown(false);
    }
  };

  // rows
  const rows = [];
  const cols = [];

  // loop
  for (let i = 0; i < gridSize[1]; i++) {
    rows.push(i);
  }
  for (let i = 0; i < gridSize[0]; i++) {
    cols.push(i);
  }

  // use effect
  useEffect(() => {
    // check size
    if (!resizing) return;

    // get first block size
    const boxWidth = document.getElementById('desktop').clientWidth / gridSize[0];
    const boxHeight = document.getElementById('desktop').clientHeight / gridSize[1];

    // spacer
    const spacer = parseInt(theme.spacing(.5).replace('px', ''));

    // size
    const top = XY[0] < HW[0] ? XY[0] : HW[0];
    const left = XY[1] < HW[1] ? XY[1] : HW[1];
    const right = XY[1] > HW[1] ? XY[1] : HW[1];
    const bottom = XY[0] > HW[0] ? XY[0] : HW[0];

    // min width/height
    const minWidth = boxWidth * 2;
    const minHeight = boxHeight * 2;

    // new width
    const newWidth = (right - left + 1) * boxWidth;
    const newHeight = (bottom - top + 1) * boxHeight;

    // create new size
    const newPosition = {
      x : (left * boxWidth) + spacer,
      y : (top * boxHeight) + spacer,

      width  : (newWidth < minWidth ? minWidth : newWidth) - (spacer * 2),
      height : (newHeight < minHeight ? minHeight : newHeight) - (spacer * 2),
    };

    // set position
    setPlace(newPosition);
  }, [...XY, ...HW]);

  // return jsx
  return (
    <Box id="desktop" sx={ {
      flex       : 1,
      width      : '100%',
      height     : '100%',
      display    : 'flex',
      overflow   : 'hidden',
      position   : 'relative',
      alignItems : 'center',

      backgroundSize     : `20px 20px`,
      backgroundImage    : `radial-gradient(rgba(255,255,255,0.25) 0.5px, transparent 0.5px), radial-gradient(rgba(255,255,255,0.25) 0.5px, transparent 0.5px)`,
      backgroundPosition : `0 0,10px 10px`,
    } }>
      <Box sx={ {
        mx             : 'auto',
        px             : 4,
        py             : 2,
        display        : 'flex',
        alignItems     : 'center',
        background     : theme.palette.background.default,
        justifyContent : 'center',
      } }>
        <Typography variant="h2">
          WELCOME TO MOON
        </Typography>
      </Box>

      { !!useGrid && (
        <Box sx={ {
          top           : 0,
          left          : 0,
          flex          : 1,
          width         : '100%',
          height        : '100%',
          zIndex        : 100,
          display       : 'flex',
          position      : 'absolute',
          flexDirection : 'column',
        } }>
          { rows.map((row) => {
            // return jsx
            return (
              <Box key={ `row-${row}` } display="flex" flex={ 1 } flexDirection="row">
                { cols.map((col) => {
                  // return jsx
                  return (
                    <Box
                      sx={ {
                        flex   : 1,
                        border : `.1rem solid rgba(255, 255, 255, 0.25)`,
                        height : '100%',
                        
                        ...(rightDown ? {
                          '&:hover' : {
                              background : `rgba(255, 255, 255, 0.1)`,
                            }
                          } : (
                            includesSize(row, col) ? {
                              background : `rgba(255, 255, 255, 0.1)`,
                            } : {}
                          )
                        ),
                      } }
                      id={ row === 0 && col === 0 ? 'size-box' : undefined }
                      key={ `col-${row}-${col}` }
                      onMouseUp={ (e) => onMoveUp(resizing, e) }
                      onMouseDown={ (e) => onMoveDown(resizing, e) }
                      onMouseOver={ (e) => rightDown ? [setXY([row, col]), setHW([row, col])] : setHW([row, col]) }
                      onContextMenu={ (e) => e.preventDefault() }
                    >

                    </Box>
                  );
                }) }
              </Box>
            );
          }) }
        </Box>
      ) }

      { desktop.shortcuts.map((item, i) => {
        // return window
        return (
          <DesktopShortcut key={ `shortcut-${item.id}` } item={ item } />
        );
      }) }
      { desktop.tasks.map((item, i) => {
        // return window
        return (
          <Window
            key={ `window-${item.id}` }
            item={ item }
            zIndex={ item.zIndex }
            desktop={ desktop }
            canDrag={ !useGrid }
            position={ resizing?.id === item.id ? place : undefined }
            
            onMoveUp={ (e) => onMoveUp(item, e) }
            onMoveDown={ (e) => onMoveDown(item, e) }
            bringToFront={ () => onBringToFront(item.id) }
          />
        );
      }) }
    </Box>
  );
};

// export default
export default MoonDesktop;