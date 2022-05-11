
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
  const { post, segment, context, account } = useParams();

  // return jsx
  return (
    <BrowseProvider post={ post } segment={ segment } context={ context } account={ account }>
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