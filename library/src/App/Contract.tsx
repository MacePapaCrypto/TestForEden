
import React from 'react';
import { Box, Stack } from '@mui/material';

// import local
import useAuth from '../useAuth';

/**
 * moon app feed
 *
 * @param props 
 */
const MoonAppContract = (props = {}) => {
  // use posts
  const auth = useAuth();

  // return jsx
  return (
    <Box width="100%" height="100%" display="flex" px={ 2 } py={ 3 }>
      <Stack spacing={ 2 } sx={ {
        width : '100%',
      } }>
        CONTRACT
      </Stack>
    </Box>
  );
}

// import moon app feed
export default MoonAppContract;