
import React from 'react';
import { Box, Stack, CircularProgress } from '@mui/material';

// import local
import useAuth from '../useAuth';
import useFeed from '../useFeed';
import PostList from '../PostList';
import PostCreate from '../PostCreate';

/**
 * moon app feed
 *
 * @param props 
 */
const MoonAppFeed = (props = {}) => {
  // use posts
  const auth = useAuth();
  const feed = useFeed({
    feed : props.item.path,
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

  // return jsx
  return (
    <Box width="100%" height="100%" display="flex" px={ 2 } py={ 3 }>
      <Stack spacing={ 2 } sx={ {
        width : '100%',
      } }>
        <PostCreate
          onPost={ onPost }
        />

        { !feed.posts?.length && feed.loading && (
          <Box display="flex" alignItems="center" justifyContent="center" py={ 5 }>
            <CircularProgress />
          </Box>
        ) }

        { !!feed.posts?.length && (
          <Box flex={ 0 } />
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
    </Box>
  );
}

// import moon app feed
export default MoonAppFeed;