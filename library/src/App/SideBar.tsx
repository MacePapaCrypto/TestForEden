
// import react
import React from 'react';
import { Box, useTheme } from '@mui/material';
import useStyles from '../useStyles';

// sub spaces
const MoonAppSideBar = (props = {}) => {
  // theme
  const theme = useTheme();
  const styles = useStyles('MoonAppSideBar');

  // return jsx
  return (
    <>
      <Box sx={ styles } className={ 
        [
          'MoonAppSideBar-root',
          props.hasSub ? 'MoonAppSideBar-withSub' : 'MoonAppSideBar-withoutSub',
          props.collapsed ? 'MoonAppSideBar-collapsed' : 'MoonAppSideBar-expanded',
        ].join(' ')
      }>
        <Box className="MoonAppSideBar-content">
          { props.children }
        </Box>
      </Box>
    </>
  )
};

// export default
export default MoonAppSideBar;