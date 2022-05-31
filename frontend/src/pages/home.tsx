
import { useHistory } from 'react-router-dom';
import { useAuth, useSocket } from '@nft/ui';
import React, { useState, useEffect } from 'react';
import { Box, Grid, Container, Stack, Typography } from '@mui/material';

// home nfts
import HomePageContract from './home/contract';

/**
 * home page
 *
 * @param props 
 */
const HomePage = (props = {}) => {
  // state
  const [contracts, setContracts] = useState([]);

  // theme
  const auth = useAuth();
  const socket = useSocket();
  const history = useHistory();

  // use effect
  useEffect(() => {
    // load contracts
    socket.get('/contract/list').then(setContracts);
  }, []);

  // layout
  return (
    <Box flex={ 1 } display="flex" flexDirection="column">
      <Container sx={ {
        py   : 2,
        flex : 1,
      } }>
        <Grid container>
          <Grid item xs={ 8 }>
            <Stack spacing={ 2 }>
              { contracts.map((contract) => {
                // return jsx
                return (
                  <Box key={ contract.id }>
                    <Typography>
                      { contract.name }
                    </Typography>
                    <HomePageContract contract={ contract } />
                  </Box>
                );
              }) }
            </Stack>
          </Grid>
          <Grid item xs={ 4 }>

          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// export default
export default HomePage;