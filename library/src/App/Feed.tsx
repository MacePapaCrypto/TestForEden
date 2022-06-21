
import React from 'react';
import { Box, Stack, CircularProgress } from '@mui/material';

// import local
import useAuth from '../useAuth';
import useFeed from '../useFeed';
import SideBar from './Feed/SideBar';
import PostList from '../Post/List';
import ScrollBar from '../ScrollBar';
import PostCreate from '../Post/Create';

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
    <Box width="100%" height="100%" display="flex">
      <Box width="100%" height="100%" display="flex" flexDirection="row">
        <SideBar />
        <Stack spacing={ 2 } sx={ {
          width : '100%',
        } }>
          <Box px={ 2 } pt={ 2 }>
            <PostCreate
              onPost={ onPost }
            />
          </Box>

          { !feed.posts?.length && feed.loading && (
            <Box display="flex" alignItems="center" justifyContent="center" py={ 5 }>
              <CircularProgress />
            </Box>
          ) }

          <ScrollBar isFlex>
            <Box sx={ {
              pt : 1,
              px : 2,
            } }>
              <PostList
                feed="feed"
                posts={ feed.posts }
                loading={ feed.loading }
                PostProps={ {
                  history,
                  withReplies : true,
                } }
              />
            </Box>
          </ScrollBar>
        </Stack>
      </Box>
    </Box>
  );
}

// import moon app feed
export default MoonAppFeed;