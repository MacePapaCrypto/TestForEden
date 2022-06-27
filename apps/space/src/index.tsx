
// import react app
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

// import
import { App, Route, useSpaces } from '@moonup/ui';

// import local
import List from './Space/List';
import Feed from './Space/Feed';
import Create from './Create';
import SideBar from './Space/SideBar';
import ExploreSideBar from './ExploreSideBar';
import SubSpaceCreate from './Space/SubSpaceCreate';

/**
 * create space app
 *
 * @param props
 */
const SpaceApp = (props = {}) => {
  // action
  const [space, action] = props.path.split('/');

  // spaces
  const subSpaces = useSpaces({
    space        : null,
    requireSpace : true,
  });
  const [feed, setFeed] = useState(['hot', 'new'].find((t) => t === action));
  const [subSpace, setSubSpace] = useState(subSpaces.spaces.find((s) => s.id === action));

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
    const [,action] = props.path.split('/');

    // set space
    setFeed(['hot', 'new'].find((t) => t === action));
    setSubSpace(subSpaces.spaces.find((s) => s.id === action));
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
      name="App Name"
      description="App Description"

      menu={ (
        <>
          <Route path="/">
            <ExploreSideBar { ...props } />
          </Route>
          <Route path="/mooning">
            <ExploreSideBar { ...props } />
          </Route>
          <Route path="/latest">
            <ExploreSideBar { ...props } />
          </Route>
          <Route path="/following">
            <ExploreSideBar { ...props } />
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
        <List
          feed="mooning"
          onClose={ props.onClose }
          bringToFront={ props.bringToFront }
        />
      </Route>
      <Route path="/latest">
        <List
          feed="latest"
          onClose={ props.onClose }
          bringToFront={ props.bringToFront }
        />
      </Route>
      <Route path="/following">
        <List
          feed="following"
          onClose={ props.onClose }
          bringToFront={ props.bringToFront }
        />
      </Route>

      <Route path="/create">
        <Create
          onClose={ props.onClose }
          bringToFront={ props.bringToFront }
        />
      </Route>

      <Route path="/space/:space/create">
        <SubSpaceCreate
          space={ null }
          onClose={ props.onClose }
          bringToFront={ props.bringToFront }
        />
      </Route>

      <Route path="/space/:space">
        <Feed
          feed="hot"
          space={ null }
          onFeed={ saveFeed }
          subSpaces={ subSpaces }
          setSubSpace={ saveSubspace }
          bringToFront={ props.bringToFront }
        />
      </Route>
      <Route path="/space/:space/hot">
        <Feed
          feed="hot"
          space={ null }
          onFeed={ saveFeed }
          subSpaces={ subSpaces }
          setSubSpace={ saveSubspace }
          bringToFront={ props.bringToFront }
        />
      </Route>
      <Route path="/space/:space/latest">
        <Feed
          feed="latest"
          space={ null }
          onFeed={ saveFeed }
          subSpaces={ subSpaces }
          setSubSpace={ saveSubspace }
          bringToFront={ props.bringToFront }
        />
      </Route>
      <Route path="/space/:space/mooning">
        <Feed
          feed="mooning"
          space={ null }
          onFeed={ saveFeed }
          subSpaces={ subSpaces }
          setSubSpace={ saveSubspace }
          bringToFront={ props.bringToFront }
        />
      </Route>
    </App>
  );
};

// export default
export default SpaceApp;