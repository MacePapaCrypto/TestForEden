
import React from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Grid, Container, Stack, useTheme, CircularProgress } from '@mui/material';
import { useBrowse, usePosts, useAuth, PostCreate, PostList, ProfileCard, SpaceCard } from '@nft/ui';


/**
 * home page
 *
 * @param props 
 */
const FeedPage = (props = {}) => {
  // theme
  const auth = useAuth();
  const theme = useTheme();
  const history = useHistory();
  const { feed : feedType, space, loadingSpace, account, loadingAccount, subSpace } = useBrowse();

  // create feed
  const feed = usePosts({
    feed    : feedType,
    space   : space?.id,
    account : account?.id,
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
      space   : space?.id,
      account : account?.id,

      ...value,
    });

    // return true
    return true;
  };

  // layout
  return (
    <Box flex={ 1 } display="flex" flexDirection="column">
      <Container sx={ {
        flex : 1,
      } }>
        <Grid container spacing={ 3 }>
          <Grid item xs={ 8 }>
            <Stack spacing={ 2 } sx={ {
              mt : 3,
            } }>
              { !!(feedType !== 'chat') && (
                <PostCreate
                  space={ space }
                  onPost={ onPost }
                />
              ) }

              { !feed.posts?.length && feed.loading && (
                <Box display="flex" alignItems="center" justifyContent="center" py={ 5 }>
                  <CircularProgress />
                </Box>
              ) }

              { !!feed.posts?.length && (
                <Box />
              ) }

              <PostList
                posts={ feed.posts }
                loading={ feed.loading === 'list' }
                PostProps={ {
                  history,
                  withReplies : true,
                } }
              />
            </Stack>
          </Grid>
          <Grid item xs={ 4 }>
            <Box mt={ 3 }>
              { !!account?.id && (
                <ProfileCard item={ account } />
              ) }
              { !subSpace?.id && !!space?.id && (
                <SpaceCard item={ space } />
              ) }
              { !!subSpace?.id && (
                <SpaceCard item={ subSpace } parent={ space } />
              ) }
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// export default
export default FeedPage;