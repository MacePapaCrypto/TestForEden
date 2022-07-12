
// import react
import React from 'react';

// import local
import { Box, Stack, useTheme, Container } from '@mui/material';
import { App, useAuth, useFeed, ScrollBar, PostCreate, PostList } from '@moonup/ui';

// local components
import FeedAppSideBar from './SideBar';

// trending
import TrendingApps from './TrendingApps';
import TrendingSpaces from './TrendingSpaces';
import TrendingPeople from './TrendingPeople';
import TrendingContracts from './TrendingContracts';

/**
 * create space app
 *
 * @param props
 */
const FeedApp = (props = {}) => {
  // use posts
  const auth = useAuth();
  const feed = useFeed({
    feed : (
      props.path === '/' ? 'me' :
      props.path === '/hot' ? 'hot' :
      props.path === '/following' ? 'following' :
      'me'
    ),
  });
  const theme = useTheme();

  // default props
  const defaultProps = {
    position : {
      x : .05,
      y : .05,

      width  : .9,
      height : .9,
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

  // skeleton height
  const sidebarWidth = parseInt(theme.spacing(30).replace('px', ''));

  // return jsx
  return (
    <App
      name="Moon Home"
      description="Welcome to Moon"

      menu={ (
        <Box>
          <FeedAppSideBar { ...props } />
        </Box>
      ) }

      ready={ true }
      default={ defaultProps }
    >
      <Stack direction="row" spacing={ 0 } sx={ {
        flex : 1,
      } }>
        <Box display="flex" flexDirection="column" flex={ 1 } py={ 2 }>
          <Container maxWidth="md" sx={ {
            flex          : 1,
            display       : 'flex',
            flexDirection : 'column',
          } }>
            <Box pb={ 2 } flex={ 0 }>
              <PostCreate
                onPost={ onPost }
              />
            </Box>
            <ScrollBar isFlex>
              <PostList
                feed="feed"
                posts={ feed.posts }
                loading={ feed.loading }
                PostProps={ {
                  withReplies : true,
                } }
              />
            </ScrollBar>
          </Container>
        </Box>
        <Box sx={ {
          flex       : 0,
          padding    : 2,
          minWidth   : sidebarWidth,
          maxWidth   : sidebarWidth,
          borderLeft : `${theme.shape.borderWidth} solid ${theme.palette.divider}`,
        } }>
          <TrendingSpaces />
          <TrendingContracts />
          <TrendingApps />
          <TrendingPeople />
        </Box>
      </Stack>
    </App>
  );
};

// export default
export default FeedApp;