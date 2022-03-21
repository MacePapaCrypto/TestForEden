
import React from 'react';
import { Post } from '@nft/ui';
import { Stack } from '@mui/material';

console.log('test', Post);

/**
 * home page
 *
 * @param props 
 */
const HomePage = (props = {}) => {

  // return jsx
  return (
    <Stack spacing={ 2 }>
      <Post />
      <Post />
      <Post />
      <Post />
      <Post />
    </Stack>
  );
};

// export default
export default HomePage;