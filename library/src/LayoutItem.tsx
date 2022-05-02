
// import react
import React from 'react';
import { Box } from '@mui/material';
import ScrollBar from './ScrollBar';

/**
 * layout item
 * 
 * @param props 
 */
const NFTLayoutItem = (props = {}) => {

  // return jsx
  return (
    <Box width="100%" height="100%" display="flex" sx={ {
      '& .ps .ps__rail-x, & .ps .ps__rail-y' : {
        background : 'transparent!important',
      }
    } }>
      <Box flex={ 1 } display="flex" flexDirection="column" component={ props.isScrollable ? ScrollBar : undefined } isFlex={ props.isScrollable ? true : undefined } { ...props } />
    </Box>
  );
};

// export default
export default NFTLayoutItem;