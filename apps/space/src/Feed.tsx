
import React from 'react';
import { Box, Stack, useTheme, CircularProgress } from '@mui/material';

// moonup
import { PostList, ScrollBar, PostCreate, useAuth, usePosts, useTyping, PostTyping } from '@moonup/ui';

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
const AppSpaceFeed = (props = {}) => {
  // theme
  const auth = useAuth();
  const theme = useTheme();
  
  // feed type
  const feedType = props.subSpace?.feed || props.feed;

  // create feed
  const feed = usePosts({
    feed  : feedType,
    space : props.subSpace?.id || props.space?.id,
  });
  const typing = useTyping({
    thread : props.subSpace?.id || props.space?.id,
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
      feed  : feedType,
      space : props.subSpace?.id || props.space?.id,

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

  // layout
  return (
    <Stack spacing={ 2 } width="100%" height="100%">
      { feedType !== 'chat' && (
        <Box px={ 2 } pt={ 2 }>
          <PostCreate
            space={ props.space }
            onPost={ onPost }
            subSpace={ props.subSpace }
            onKeyDown={ onKeyDown }
          />
        </Box>
      ) }

      { !!(props.loading || (!feed.posts?.length && feed.loading)) && (
        <Box display="flex" alignItems="center" justifyContent="center" flex={ 1 } py={ 5 }>
          <CircularProgress />
        </Box>
      ) }

      <ScrollBar isFlex keepBottom={ feedType === 'chat' }>
        <Box sx={ {
          pt : 1,
          px : 2,
        } }>
          <PostList
            feed={ feedType }
            posts={ feed.posts }
            space={ props.space }
            loading={ feed.loading }
            subSpace={ props.subSpace }
            PostProps={ {
              history,
              withReplies : feedType !== 'chat',
            } }
          />
        </Box>
      </ScrollBar>

      { feedType === 'chat' && (
        <Box px={ 2 } py={ 2 }>
          <PostTyping
            mb={ 1 }
            ml={ `calc(40px + ${theme.spacing(2)})` }
            typing={ typing.typing }
          />
          <PostCreate
            size="small"
            space={ props.space }
            onPost={ onPost }
            subSpace={ props.subSpace }
          />
        </Box>
      ) }
    </Stack>
  );
};

// export default
export default AppSpaceFeed;