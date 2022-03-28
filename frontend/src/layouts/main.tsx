
import React from 'react';
import { Box, Stack, Container, Typography, useTheme } from '@mui/material';

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
    <>
      <Container maxWidth="xl" sx={ {
        
      } }>
        <Stack direction="row" spacing={ 2 }>
          <Box width={ sidebarWidth } py={ 2 }>
            <Typography variant="body2">
              LEFT
            </Typography>
          </Box>

          <Box flex={ 1 } py={ 2 } px={ 3 } sx={ {
            minHeight  : '100vh',
            background : 'rgba(0, 0, 0, 0.4)',
          } }>
            { props.children }
          </Box>

          <Box width={ sidebarWidth } py={ 2 }>
            <Typography variant="body2">
              Right
            </Typography>
          </Box>
        </Stack>
      </Container>
    </>
  );
};

// export default
export default MainLayout;