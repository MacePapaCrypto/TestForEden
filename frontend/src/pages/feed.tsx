
import React from 'react';
import MetaTags from 'react-meta-tags';
import { useHistory } from 'react-router-dom';
import { Box, Grid, Container, Stack, useTheme, CircularProgress } from '@mui/material';
import { useBrowse, useTyping, usePosts, useAuth, ScrollBar, PostTyping, PostCreate, PostList } from '@nft/ui';

// local
import NftPage from './nft';
import Metadata from './meta';

// timeout
let timeout;
const debounce = (fn, to = 200) => {
  // clear timeout
  clearTimeout(timeout);

  // timeout
  timeout = setTimeout(fn, to);
};

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
    space   : subSpace?.id || space?.id,
    account : account?.id,
  });
  const typing = useTyping({
    thread : subSpace?.id,
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
    const loading = feed.create({
      feed    : feedType,
      space   : subSpace?.id || space?.id,
      account : account?.id,

      ...value,
    });

    // check return
    if (feedType === 'chat') return true;

    // await
    await loading;

    // return true
    return true;
  };

  // on key up
  const onKeyDown = async () => {
    // debounce
    debounce(() => {
      // call typing
      typing.update(true);
    });
  };

  // title
  const title = (
    account?.id ? account.id :
    subSpace?.id ? subSpace.name :
    space?.id ? space.name :
    null
  );

  // layout
  return (
    <>
      <Box flex={ 1 } display="flex" flexDirection="column">
        <Container sx={ {
          flex : 1,
        } }>
          <Grid container spacing={ 3 }>
            <Grid item xs={ 8 }>
              { /* FEED FEED */ }
              { ['hot', 'new', 'feed'].includes(feedType) && (
                <Stack spacing={ 2 } sx={ {
                  mt : 3,
                } }>
                  <PostCreate
                    space={ space }
                    onPost={ onPost }
                    subSpace={ subSpace }
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
                    feed={ feedType }
                    posts={ feed.posts }
                    loading={ feed.loading }
                    PostProps={ {
                      history,
                      withReplies : feedType !== 'chat',
                    } }
                  />
                </Stack>
              ) }

              { feedType === 'nft' && (
                <Box flex={ 1 } py={ 2 }>
                  <NftPage { ...props } />
                </Box>
              ) }

              { /* CHAT FEED */ }
              { feedType === 'chat' && (
                <Box flex={ 1 } height="100vh" display="flex" flexDirection="column">
                  <Box flex={ 1 } display="flex">
                    { !!(!feed.posts?.length && feed.loading) ? (
                      <Box display="flex" alignItems="center" justifyContent="center" py={ 5 } flex={ 1 }>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ScrollBar isFlex keepBottom updated={ feed.updated }>
                        <Box py={ 2 }>
                          <PostList
                            feed={ feedType }
                            posts={ feed.posts }
                            loading={ feed.loading }
                            PostProps={ {
                              history,
                            } }
                          />
                        </Box>
                      </ScrollBar>
                    ) }
                  </Box>

                  <PostTyping
                    mb={ 1 }
                    ml={ `calc(40px + ${theme.spacing(2)})` }
                    typing={ typing.typing }
                  />

                  <Box mb={ 2 }>
                    <PostCreate
                      size="small"
                      edge="bottom"
                      space={ space }
                      onPost={ onPost }
                      subSpace={ subSpace }
                      onKeyDown={ onKeyDown }
                    />
                  </Box>
                </Box>
              ) }
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
                  <SubSpaceCard item={ subSpace } />
                ) }
              </Box>
            </Grid>
            
          </Grid>
        </Container>
      </Box>
    </>
  );
};

// export default
export default FeedPage;