
import React from 'react';
import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { SideBar, BrowseProvider } from '@nft/ui';

/**
 * home page
 *
 * @param props 
 */
const MainLayout = (props = {}) => {
  // params
  const { feed, post, space, account } = useParams();

  // return jsx
  return (
    <BrowseProvider feed={ feed } post={ post } space={ space } account={ account }>
      <Box flex={ 1 } display="flex" flexDirection="row">
        <SideBar />
        <Box flex={ 1 }>
          { props.children }
        </Box>
      </Box>
    </BrowseProvider>
  );
};

// export default
export default MainLayout;