
import Tag from '@mui/icons-material/Tag';
import More from '@mui/icons-material/MoreVert';
import React from 'react';
import Search from '@mui/icons-material/Search';
import { useHistory } from 'react-router-dom';
import { useBrowse, usePosts, useAuth, PostCreate, PostList, ProfileCard } from '@nft/ui';
import { Box, Grid, Toolbar, AppBar, Typography, IconButton, Container, Stack, useTheme, CircularProgress } from '@mui/material';


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
  const { context, loadingContext, segment, loadingSegment, account, loadingAccount } = useBrowse();

  // get type
  const contextFeed = context && ['feed', 'channel', 'gallery', 'shop'].includes(context.feed || 'feed') ? (context.feed || 'feed') : null;

  // create feed
  const feed = usePosts({
    feed    : contextFeed,
    account : account?.id,
    context : context?.id,
    segment : segment?.id,
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
      account : account?.id,
      context : context?.id,
      segment : segment?.id,

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
        { !!(loadingContext || context || loadingSegment || segment) && (
          <AppBar sx={ {
            bgcolor                 : theme.palette.background.paper,
            borderTop               : 'none',
            marginBottom            : theme.spacing(3),
            borderTopLeftRadius     : 0,
            borderTopRightRadius    : 0,
            borderBottomLeftRadius  : theme.spacing(1.5),
            borderBottomRightRadius : theme.spacing(1.5),
          } } position="static" elevation={ 0 }>
            <Toolbar>
              <Box mr={ 1 } display="flex">
                { !context && !segment ? (
                  <CircularProgress size={ 20 } />
                ) : (
                  <Tag />
                ) }
              </Box>

              <Typography variant="h6" color="inherit" component="div">
                { !context && !segment ? 'Loading...' : (context?.name || segment?.name) }
              </Typography>
              <IconButton
                sx={ {
                  ml : 'auto',
                } }
                size="large"
                color="inherit"
              >
                <Search />
              </IconButton>
              <IconButton
                size="large"
                color="inherit"
              >
                <More />
              </IconButton>
            </Toolbar>
          </AppBar>
        ) }

        <Grid container spacing={ 3 }>
          <Grid item xs={ 8 }>
            <Stack spacing={ 2 }>
              { !!(contextFeed === 'feed' || (!context && segment)) && (
                <PostCreate
                  onPost={ onPost }
                  context={ context }
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
                loading={ feed.loading }
                PostProps={ {
                  history,
                  withReplies : true,
                } }
              />
            </Stack>
          </Grid>
          <Grid item xs={ 4 }>
            <Box my={ 2 }>
              { !!account?.id && (
                <ProfileCard item={ account } />
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