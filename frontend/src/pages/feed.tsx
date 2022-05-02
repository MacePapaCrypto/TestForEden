
import Tag from '@mui/icons-material/Tag';
import More from '@mui/icons-material/MoreVert';
import React from 'react';
import Search from '@mui/icons-material/Search';
import { useHistory } from 'react-router-dom';
import { useBrowse, usePosts, useAuth, PostCreate, PostList } from '@nft/ui';
import { Box, Grid, Toolbar, AppBar, Typography, IconButton, Container, Divider, Stack, useTheme, CircularProgress } from '@mui/material';

/**
 * home page
 *
 * @param props 
 */
const HomePage = (props = {}) => {
  // theme
  const auth = useAuth();
  const theme = useTheme();
  const history = useHistory();
  const { context, loadingContext, segment, loadingSegment, loading } = useBrowse();

  // get type
  const contextFeed = context && ['feed', 'channel', 'gallery', 'shop'].includes(context.feed || 'feed') ? (context.feed || 'feed') : null;

  // create feed
  const feed = usePosts({
    feed    : contextFeed,
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
      <Container maxWidth="xl" sx={ {
        flex : 1,
      } }>
        { !!(loadingContext || context || loadingSegment || segment) && (
          <AppBar sx={ {
            bgcolor                 : theme.palette.background.paper,
            marginBottom            : theme.spacing(3),
            borderBottomLeftRadius  : theme.spacing(1.5),
            borderBottomRightRadius : theme.spacing(1.5),
          } } position="static" elevation={ 1 }>
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
        <Grid container>
          <Grid item xs={ 7 }>
            <Stack spacing={ 2 }>
              { !!(contextFeed === 'feed' || (!context && segment)) && (
                <PostCreate
                  onPost={ onPost }
                  context={ context }
                />
              ) }

              { !feed.posts?.length && (
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
                } }
              />
            </Stack>
          </Grid>
          <Grid item xs={ 5 }>

          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// export default
export default HomePage;