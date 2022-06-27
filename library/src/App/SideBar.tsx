
// import react
import { Box, useTheme } from '@mui/material';
import React, { useState } from 'react';

// sub spaces
const MoonAppSideBar = (props = {}) => {
  // theme
  const theme = useTheme();

  // skeleton height
  const subspaceWidth = parseInt(theme.spacing(30).replace('px', ''));

  // return jsx
  return (
    <>
      <Box sx={ {
        px          : theme.spacing(2),
        py          : theme.spacing(2),
        width       : subspaceWidth,
        height      : '100%',
        borderRight : `.1rem solid ${theme.palette.divider}`,

        '&:empty' : {
          display : 'none',
        }
      } }>
        { props.children }
      </Box>
    </>
  )
};

// export default
export default MoonAppSideBar;