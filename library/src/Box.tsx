
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
      background   : 'rgba(255,255,255,0.05)',
      borderRadius : theme.spacing(1),

      ...(props.sx || {}),
    } } elevation={ props.elevation || 1 }>
      { props.children }
    </Paper>
  );
};

// box
export default NFTBox;