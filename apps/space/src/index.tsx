
// import react app
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

// import
import { App, Route, useSpaces, useSocket } from '@moonup/ui';

// import local
import Feed from './Feed';
import Create from './Create';
import Explore from './Explore';
import SideBar from './SideBar';
import CreateSub from './Create/Sub';
import SideBarExplore from './SideBar/Explore';

/**
 * create space app
 *
 * @param props
 */
const SpaceApp = (props = {}) => {
  // action
  const [,,spaceId, action] = props.path.split('/');

  // space
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(false);

  // spaces
  const socket = useSocket();
  const subSpaces = useSpaces({
    space,
    requireSpace : true,
  });
  const [feed, setFeed] = useState(['hot', 'new'].find((t) => t === action));
  const [subSpace, setSubSpace] = useState(subSpaces.spaces.find((s) => s.id === action));

  // load space
  const loadSpace = async (spaceId) => {
    // check space id
    if (!spaceId) {
      setSpace(null);
      setLoading(false);

      // return
      return;
    }

    // get space
    setLoading(true);

    // get
    const actualSpace = await socket.get(`/space/${spaceId}`);

    // set space
    setSpace(actualSpace || null);
    setLoading(false);
  };

  // save feed
  const saveFeed = async (feed) => {
    // set sub space
    setFeed(feed);
    setSubSpace(null);

    // set new path
    props.pushPath(`/${space}/${feed}`);
  };

  // save subspace
  const saveSubspace = async (subSpace) => {
    // set sub space
    setSubSpace(subSpace);

    // set new path
    props.pushPath(`/${space}${subSpace?.id ? `/${subSpace.id}` : ''}`);
  };

  // path change
  useEffect(() => {
    // action
    const [,,spaceId,action] = props.path.split('/');

    // set space
    setFeed(['hot', 'new'].find((t) => t === action));
    setSubSpace(subSpaces.spaces.find((s) => s.id === action));

    // load space
    loadSpace(spaceId);
  }, [props.path]);

  // use effect
  useEffect(() => {
    // check space
    if (subSpace) return;
    if (!subSpaces.spaces?.length) return;

    // set sub space
    setSubSpace(subSpaces.spaces.find((s) => s.id === action));
  }, [subSpaces.spaces?.length]);

  // default props
  const defaultProps = {
    position : {
      x : .1,
      y : .1,

      width  : .8,
      height : .8,
    },
  };

  // return jsx
  return (
    <App
      name={ space?.name || 'Explore Spaces' }

      menu={ (
        <>
          <Route path="/">
            <SideBarExplore { ...props } />
          </Route>
          <Route path="/mooning">
            <SideBarExplore { ...props } />
          </Route>
          <Route path="/latest">
            <SideBarExplore { ...props } />
          </Route>
          <Route path="/following">
            <SideBarExplore { ...props } />
          </Route>
          <Route path="/space/:space">
            <SideBar { ...props } space={ space } subSpaces={ subSpaces } loading={ loading } />
          </Route>
          <Route path="/space/:space/:route">
            <SideBar { ...props } space={ space } subSpaces={ subSpaces } loading={ loading } />
          </Route>
        </>
      ) }

      ready={ true }
      default={ defaultProps }
    >
      <Route path="/">
        <Box>
          HOME
        </Box>
      </Route>
      <Route path="/mooning">
        <Explore
          { ...props }
          feed="mooning"
        />
      </Route>
      <Route path="/latest">
        <Explore
          { ...props }
          feed="latest"
        />
      </Route>
      <Route path="/following">
        <Explore
          { ...props }
          feed="following"
        />
      </Route>

      <Route path="/create">
        <Create
          { ...props }
        />
      </Route>

      <Route path="/space/:space/create">
        <CreateSub
          { ...props }

          space={ space }
          loading={ loading }
          subSpaces={ subSpaces }
        />
      </Route>

      <Route path="/space/:space">
        <Feed
          { ...props }
          feed="hot"
          space={ null }
          onFeed={ saveFeed }
          subSpaces={ subSpaces }
          setSubSpace={ saveSubspace }

          space={ space }
          loading={ loading }
          subSpaces={ subSpaces }
        />
      </Route>
      <Route path="/space/:space/hot">
        <Feed
          { ...props }
          feed="hot"
          space={ null }
          onFeed={ saveFeed }
          subSpaces={ subSpaces }
          setSubSpace={ saveSubspace }

          space={ space }
          loading={ loading }
          subSpaces={ subSpaces }
        />
      </Route>
      <Route path="/space/:space/latest">
        <Feed
          { ...props }
          feed="latest"
          space={ null }
          onFeed={ saveFeed }
          subSpaces={ subSpaces }
          setSubSpace={ saveSubspace }

          space={ space }
          loading={ loading }
          subSpaces={ subSpaces }
        />
      </Route>
      <Route path="/space/:space/mooning">
        <Feed
          { ...props }
          feed="mooning"
          space={ null }
          onFeed={ saveFeed }
          subSpaces={ subSpaces }
          setSubSpace={ saveSubspace }

          space={ space }
          loading={ loading }
          subSpaces={ subSpaces }
        />
      </Route>
    </App>
  );
};

// export default
export default SpaceApp;