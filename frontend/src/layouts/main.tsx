
import React from 'react';
import { Box, Grid, Stack, Container, Typography, useTheme } from '@mui/material';

// main bar
import MainBar from './main/bar';

/**
 * home page
 *
 * @param props 
 */
const MainLayout = (props = {}) => {
  // theme
  const theme = useTheme();

  // width
  const sidebarWidth = '220px';

  // return jsx
  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <MainBar />
      <Container maxWidth="xl" sx={ {
        flex : 1,
      } }>
        { props.children }
      </Container>
    </Box>
  );
};

// export default
export default MainLayout;