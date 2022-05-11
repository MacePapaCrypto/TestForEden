
import React from 'react';
import { Box, Paper, Container, useTheme, CircularProgress } from '@mui/material';
import { Post, usePosts, useTyping, useAuth, useBrowse, PostList, ScrollBar, PostTyping, PostCreate } from '@nft/ui';

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
  const typing = useTyping({
    thread : post.post?.id || props.post,
  });

  // on post
  const onPost = async (value) => {
    // done typing
    typing.update(false);

    // check add
    if (!auth.account) {
      // login
      auth.login();

      // login
      return false;
    }

    // log
    feed.create({
      feed   : 'chat',
      thread : post.post?.id || props.post,
      
      ...value,
    });

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

  // layout
  return (
    <Box flex={ 1 } display="flex" flexDirection="column">
      <Container sx={ {
        flex          : 1,
        height        : '100vh',
        display       : 'flex',
        minHeight     : '100vh',
        maxHeight     : '100vh',
        flexDirection : 'column',
      } }>

        <Box sx={ {
          py   : 2,
          flex : 0,
        } }>
          { !!post.loading && (
            <Box display="flex" alignItems="center" justifyContent="center" py={ 2 }>
              <CircularProgress />
            </Box>
          ) }
          { !post.loading && !!post.post && (
            <Post item={ post.post } noShare feed="feed" EmbedProps={ {
              embedWidth : theme.spacing(60),
            } } />
          ) }
        </Box>
        
        <Box flex={ 1 } display="flex" flexDirection="column" ml="10px">
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

          <PostTyping
            mb={ 1 }
            ml={ `calc(40px + ${theme.spacing(2)})` }
            typing={ typing.typing }
          />

          { !!post.post?.id && (
            <Box mb={ 2 }>
              <PostCreate
                size="small"
                edge="bottom"
                onPost={ onPost }
                context={ context }
                onKeyDown={ onKeyDown }
              />
            </Box>
          ) }
        </Box>
      </Container>
    </Box>
  );
};

// export default
export default PostPage;