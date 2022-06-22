
// import react app
import React from 'react';
import { App } from '@moonup/ui';
import { Box } from '@mui/material';

/**
 * create space app
 *
 * @param props
 */
const SpaceApp = (props = {}) => {

  // default props
  const defaultProps = {
    position : {
      x : .1,
      y : .1,

      width  : .8,
      height : .8,
    },
  };

  // return jsx
  return (
    <App
      name="App Name"
      description="App Description"

      menu={ (
        <Box>
          App Menu
        </Box>
      ) }

      ready={ true }
      default={ defaultProps }
    >
      <Box>
        Actual inner space
      </Box>
    </App>
  );
};

// export default
export default SpaceApp;