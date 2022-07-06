
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
  const [,,spaceId, action, subSpaceId] = props.path.split('/');

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
  const [subSpace, setSubSpace] = useState(subSpaces.spaces.find((s) => s.id === subSpaceId));

  // load space
  const loadSpace = async (spaceId) => {
    // check space id
    if (!spaceId) {
      setSpace(null);
      setLoading(false);

      // return
      return;
    }

    // cehck exists
    if (spaceId === space?.id) return;

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
    props.pushPath(`/space/${spaceId}/${feed}`);
  };

  // save subspace
  const saveSubspace = async (subSpace) => {
    // set sub space
    setSubSpace(subSpace);

    // set new path
    props.pushPath(`/space/${spaceId}${subSpace?.id ? `/sub/${subSpace.id}` : ''}`);
  };

  // path change
  useEffect(() => {
    // action
    const [,,spaceId, action, subSpaceId] = props.path.split('/');

    // set space
    setFeed(['hot', 'new'].find((t) => t === action));
    setSubSpace(subSpaces.spaces.find((s) => s.id === subSpaceId));

    // load space
    loadSpace(spaceId);
  }, [props.path]);

  // use effect
  useEffect(() => {
    // action
    const [,,spaceId, action, subSpaceId] = props.path.split('/');

    // check space
    if (subSpace) return;
    if (!subSpaces.spaces?.length) return;

    // set sub space
    setSubSpace(subSpaces.spaces.find((s) => s.id === subSpaceId));
  }, [subSpaces.spaces?.length]);

  // default props
  const defaultProps = {
    position : {
      x : `${props.path}`.includes('/create') ? .2 : .1,
      y : `${props.path}`.includes('/create') ? .2 : .1,

      width  : `${props.path}`.includes('/create') ? .6 : .8,
      height : `${props.path}`.includes('/create') ? .6 : .8,
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
          { !`${props.path}`.includes('/create') && (
            <>
              <Route path="/space/:space">
                <SideBar
                  { ...props }
                  feed={ feed }
                  space={ space }
                  onFeed={ saveFeed }
                  subSpace={ subSpace }
                  subSpaces={ subSpaces }
                  setSubSpace={ saveSubspace }
                />
              </Route>
              <Route path="/space/:space/:route">
                <SideBar
                  { ...props }
                  feed={ feed }
                  space={ space }
                  onFeed={ saveFeed }
                  subSpace={ subSpace }
                  subSpaces={ subSpaces }
                  setSubSpace={ saveSubspace }
                />
              </Route>
              <Route path="/space/:space/:route/:sub">
                <SideBar
                  { ...props }
                  feed={ feed }
                  space={ space }
                  onFeed={ saveFeed }
                  subSpace={ subSpace }
                  subSpaces={ subSpaces }
                  setSubSpace={ saveSubspace }
                />
              </Route>
            </>
          ) }
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
          onFeed={ saveFeed }
          setSubSpace={ saveSubspace }

          space={ space }
          loading={ loading }
          subSpace={ subSpace }
          subSpaces={ subSpaces }
        />
      </Route>
      <Route path="/space/:space/hot">
        <Feed
          { ...props }
          feed="hot"
          onFeed={ saveFeed }
          setSubSpace={ saveSubspace }

          space={ space }
          loading={ loading }
          subSpace={ subSpace }
          subSpaces={ subSpaces }
        />
      </Route>
      <Route path="/space/:space/latest">
        <Feed
          { ...props }
          feed="latest"
          onFeed={ saveFeed }
          subSpaces={ subSpaces }
          setSubSpace={ saveSubspace }

          space={ space }
          loading={ loading }
          subSpace={ subSpace }
          subSpaces={ subSpaces }
        />
      </Route>
      <Route path="/space/:space/mooning">
        <Feed
          { ...props }
          feed="mooning"
          onFeed={ saveFeed }
          setSubSpace={ saveSubspace }

          space={ space }
          loading={ loading }
          subSpace={ subSpace }
          subSpaces={ subSpaces }
        />
      </Route>
      <Route path="/space/:space/sub/:subSpace">
        <Feed
          { ...props }
          feed="mooning"
          onFeed={ saveFeed }
          setSubSpace={ saveSubspace }

          space={ space }
          loading={ loading }
          subSpace={ subSpace }
          subSpaces={ subSpaces }
        />
      </Route>
    </App>
  );
};

// export default
export default SpaceApp;