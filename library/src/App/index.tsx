
// import react
import { Box, useTheme } from '@mui/material';
import React, { useState, useContext, useEffect } from 'react';

// locals
import Bar from '../Window/Bar';
import SideBar from './SideBar';
import Context from '../Window/Context';
import useStyles from '../useStyles';
import useDesktop from '../useDesktop';

/**
 * create app
 *
 * @param props 
 */
const MoonApp = (props = {}) => {
  // desktop
  const theme = useTheme();
  const styles = useStyles('MoonApp');
  const desktop = useDesktop();

  // use context
  const task = useContext(Context);
  
  // sub space
  const subspaceWidth = parseInt(theme.spacing(8).replace('px', ''));

  // large grid size
  const largeGridSize = 20;

  // use effect
  useEffect(() => {
    // check position
    if (task.placed) return;
    if (!task.setPlace) return;

    // set default size
    const maxWidth = theme.breakpoints.values.xl;

    // check window size
    const windowWidth = window.innerWidth;
    const actualWidth = windowWidth > maxWidth ? maxWidth : windowWidth;

    // left size
    const leftSize = (windowWidth - actualWidth) / 2;

    // default values
    const defaultX = (props.default?.position?.x || 0);
    const defaultY = (props.default?.position?.y || 0);
    const defaultWidth  = (props.default?.position?.width || 1);
    const defaultHeight = (props.default?.position?.height || 1);

    // set actual position
    const newPosition = {
      width  : (actualWidth * defaultWidth) - (defaultX === 0 ? largeGridSize : 0),
      height : (document.getElementById('desktop').clientHeight * defaultHeight) - (defaultY === 0 ? (largeGridSize * 2) : largeGridSize),

      x : leftSize + (actualWidth * defaultX),
      y : defaultY === 0 ? largeGridSize : (document.getElementById('desktop').clientHeight * defaultY),
    };

    // log
    task.setPlace({
      ...task.place,
      ...newPosition,
    });
  }, [props.default?.position, task.setPlace]);

  // return jsx
  return (
    <>
      <Bar
        name={ props.name }
        menu={ !!props.menu }
        active={ desktop.activeTask === task.item?.id }

        onDelete={ () => desktop.deleteTask(task.item) }
        onMoveUp={ task.onMoveUp }
        collapsed={ task.item?.collapsed }
        onCollapse={ task.onCollapse }
        onMoveDown={ task.onMoveDown }
        isElectron={ task.isElectron }
      />
      <Box flex={ 1 } display="flex" flexDirection="row">
        { !!props.sub && (
          <Box width={ subspaceWidth }>
            { props.sub}
          </Box>
        ) }
        <Box sx={ {
          ...styles,

          flexDirection : 'row',
        } } className={
          [
            'MoonApp-root',
            !!props.sub ? 'MoonApp-withSub' : null,
            !!props.menu ? 'MoonApp-withMenu' : null,
            !!task.item?.collapsed ? 'MoonApp-collapsed' : 'MoonApp-shown',
          ].filter((v) => v).join(' ')
        }>
          { !!props.menu && (
            <SideBar collapsed={ task.item?.collapsed } hasSub={ !!props.sub }>
              { props.menu }
            </SideBar>
          ) }
          <Box display="flex" flex={ 1 } flexDirection="column">
            { props.children }
          </Box>
        </Box>
      </Box>
    </>
  );
};

// export default
export default MoonApp;