
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
  const sidebarWidth = '260px';

  // return jsx
  return (
    <>
      <MainBar />
      <Container maxWidth="xl" sx={ {
        mt : theme.spacing(4),
      } }>
        <Stack direction="row" spacing={ 2 }>
          <Box width={ sidebarWidth }>
            <Typography variant="body2">
              LEFT
            </Typography>
          </Box>

          <Box flex={ 1 }>
            { props.children }
          </Box>

          <Box width={ sidebarWidth }>
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