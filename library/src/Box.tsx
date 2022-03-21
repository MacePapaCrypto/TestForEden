
// import box
import React from 'react';
import { Box, useTheme } from '@mui/material';

// nft box
const NFTBox = (props = {}) => {
  // theme
  const theme = useTheme();

  // return jsx
  return (
    <Box { ...props } sx={ {
      color        : '#fff',
      border       : `1px solid ${theme.palette.primary.light}`,
      padding      : theme.spacing(2),
      background   : theme.palette.primary.main,
      borderRadius : theme.spacing(1),

      ...(props.sx || {}),
    } }>
      { props.children }
    </Box>
  );
};

// box
export default NFTBox;