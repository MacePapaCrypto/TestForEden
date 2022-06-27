
import React from 'react';
import { Box, Stack, CircularProgress } from '@mui/material';

// import local
import { App, PostList, ScrollBar, PostCreate, useAuth, useFeed } from '@moonup/ui';

// side bar
import SideBar from './SideBar';

/**
 * create space app
 *
 * @param props
 */
const FeedApp = (props = {}) => {
  // feed
  let feedType = props.path.split('/').pop();

  // set feed
  if (!['hot', 'latest', 'following'].includes(feedType)) feedType = 'hot';

  // use posts
  const auth = useAuth();
  const feed = useFeed({
    feed : feedType,
  });

  // default props
  const defaultProps = {
    position : {
      x : .1,
      y : .1,

      width  : .8,
      height : .8,
    },
  };

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
    <App
      name="Moon Feed"
      description="My Social Feed"

      menu={ (
        <SideBar { ...props } feed={ feedType } />
      ) }

      ready={ true }
      default={ defaultProps }
    >
      <Stack spacing={ 2 } sx={ {
        flex  : 1,
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

        <Box flex={ 1 } display="flex">
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
        </Box>
      </Stack>
    </App>
  );
};

// export default
export default FeedApp;