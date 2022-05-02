
import React from 'react';
import { Box, Paper, Container, useTheme, CircularProgress } from '@mui/material';
import { Post, usePosts, useAuth, useBrowse, PostList, ScrollBar, PostCreate } from '@nft/ui';

/**
 * home page
 *
 * @param props 
 */
const PostPage = (props = {}) => {
  // theme
  const auth = useAuth();
  const theme = useTheme();
  const { loadingContext, context, loadingSegment, segment, post } = useBrowse();

  // create feed
  const feed = usePosts({
    feed   : 'chat',
    thread : post.post?.id || props.post,
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
    feed.create({
      thread : post.post?.id || props.post,
      ...value,
    });

    // return true
    return true;
  };

  // layout
  return (
    <Box flex={ 1 } display="flex" flexDirection="column">
      <Container maxWidth="xl" sx={ {
        flex          : 1,
        height        : '100vh',
        display       : 'flex',
        minHeight     : '100vh',
        maxHeight     : '100vh',
        flexDirection : 'column',
      } }>

        <Paper elevation={ 1 } sx={ {
          flex                    : 0,
          padding                 : theme.spacing(2),
          borderBottomLeftRadius  : theme.spacing(1.5),
          borderBottomRightRadius : theme.spacing(1.5),
        } }>
          { !!post.loading && (
            <Box display="flex" alignItems="center" justifyContent="center" py={ 5 }>
              <CircularProgress />
            </Box>
          ) }
          { !post.loading && !!post.post && (
            <Post item={ post.post } noShare feed="feed" EmbedProps={ {
              embedWidth : theme.spacing(60),
            } } />
          ) }
        </Paper>
        
        <Box flex={ 1 } display="flex">
          <ScrollBar isFlex keepBottom updated={ feed.updated }>
            <Box pb={ 2 }>
              <PostList
                feed="chat"
                posts={ feed.posts }
                loading={ feed.loading }
                PostProps={ {
                  history,
                } }
              />
            </Box>
          </ScrollBar>
        </Box>

        { !!post.post?.id && (
          <Box mb={ 2 }>
            <PostCreate
              size="small"
              edge="bottom"
              onPost={ onPost }
              context={ context }
            />
          </Box>
        ) }
      </Container>
    </Box>
  );
};

// export default
export default PostPage;