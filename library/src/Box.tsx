
// import box
import React from 'react';
import { Paper, useTheme } from '@mui/material';

// nft box
const NFTBox = (props = {}) => {
  // theme
  const theme = useTheme();

  // return jsx
  return (
    <Paper { ...props } sx={ {
      padding      : theme.spacing(2),
      background   : theme.palette.background.default,
      borderRadius : theme.spacing(1),

      ...(props.sx || {}),
    } } elevation={ props.elevation || 1 }>
      { props.children }
    </Paper>
  );
};

// box
export default NFTBox;