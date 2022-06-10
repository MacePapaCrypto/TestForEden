
import React from 'react';
import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { TaskBar, DesktopProvider } from '@nft/ui';

/**
 * home page
 *
 * @param props 
 */
const MainLayout = (props = {}) => {
  // params
  const { feed, post, space, account } = useParams();

  // position
  const taskBarStyle = 'fixed';
  const taskBarPosition = 'bottom';

  // return jsx
  return (
    <DesktopProvider>
      <Box flex={ 1 } height="100vh" width="100vw" display="flex" flexDirection={ ['top', 'bottom'].includes(taskBarPosition) ? 'column' : 'row' }>
        { ['top', 'left'].includes(taskBarPosition) && (
          <TaskBar position={ taskBarPosition } style={ taskBarStyle } />
        ) }
        <Box flex={ 1 } display="flex">
          { props.children }
        </Box>
        { ['bottom', 'right'].includes(taskBarPosition) && (
          <TaskBar position={ taskBarPosition } style={ taskBarStyle } />
        ) }
      </Box>
    </DesktopProvider>
  );
};

// export default
export default MainLayout;