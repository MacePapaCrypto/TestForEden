
// import react
import { faBell, faMoon } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useRef, useState } from 'react';
import { Box, Stack, Paper, Button, useTheme } from '@mui/material';

// local
import Task from './index';
import useStyles from '../useStyles';
import StartMenu from '../StartMenu';
import useDesktop from '../useDesktop';

// nft sidebar
const MoonTaskBar = (props = {}) => {
  // theme
  const theme = useTheme();
  const style = props.style || 'floating';
  const styles = useStyles('MoonTaskBar');
  const desktop = useDesktop();
  const position = props.position || 'bottom';
  const [startMenu, setStartMenu] = useState(false);
  const contentStyles = useStyles('MoonTaskBarContent');

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
      <Box sx={ styles } ref={ startMenuRef } className={
        [
          'MoonTaskBar-root',
          `MoonTaskBar-${position}`,
          isVertical ? 'MoonTaskBar-vertical' : 'MoonTaskBar-horizontal',
          style === 'floating' ? 'MoonTaskBar-floating' : 'MoonTaskBar-fixed',
        ].filter(b => b).join(' ')
      }>
        <Paper sx={ contentStyles } className={
          [
            'MoonTaskBarContent-root',
            `MoonTaskBarContent-${position}`,
            isVertical ? 'MoonTaskBarContent-vertical' : 'MoonTaskBarContent-horizontal',
            style === 'floating' ? 'MoonTaskBarContent-floating' : 'MoonTaskBarContent-fixed',
          ].join(' ')
        } { ...(theme.components.MoonTaskBarContent?.defaultProps || {}) }>
          <Stack className="MoonTaskBarContent-stack" direction={ isVertical ? 'column' : 'row' } spacing={ 1 }>
            <Button sx={ {
              width  : `${taskBarItemSize}px`,
              height : `${taskBarItemSize}px`,
            } } color="primary" className="MoonTaskBarContent-button" onClick={ (e) => setStartMenu(true) }>
              <FontAwesomeIcon icon={ faMoon } size="lg" />
            </Button>

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

            <Button sx={ {
              width  : `${taskBarItemSize}px`,
              height : `${taskBarItemSize}px`,
            } } color="primary" className="MoonTaskBarContent-button">
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