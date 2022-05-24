
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useFeed, useAuth, PostCreate, PostList } from '@nft/ui';
import { Box, Grid, Container, Stack, CircularProgress } from '@mui/material';

/**
 * home page
 *
 * @param props 
 */
const HomePage = (props = {}) => {
  // theme
  const auth = useAuth();
  const history = useHistory();

  // create feed
  const feed = useFeed({
    feed : 'public',
  });

  // on post
  const onPost = async (value) => {
    // check add
    if (!auth.account) {
      // login
      auth.login();

      // login
      return false;
    }

    // log
    await feed.create({
      ...value,
    });

    // return true
    return true;
  };

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
              <PostCreate
                onPost={ onPost }
              />

              { !feed.posts?.length && feed.loading && (
                <Box display="flex" alignItems="center" justifyContent="center" py={ 5 }>
                  <CircularProgress />
                </Box>
              ) }

              { !!feed.posts?.length && (
                <Box />
              ) }

              <PostList
                feed="feed"
                posts={ feed.posts }
                loading={ feed.loading }
                PostProps={ {
                  history,
                  withReplies : true,
                } }
              />
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