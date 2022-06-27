
// import react app
import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';

// import
import { App, useSpaces, useDesktop } from '@moonup/ui';

// import local
import List from './Space/List';
import Feed from './Space/Feed';
import Create from './Space/Create';
import SideBar from './Space/SideBar';
import SubSpaceCreate from './Space/SubSpaceCreate';

/**
 * create space app
 *
 * @param props
 */
const SpaceApp = (props = {}) => {
  // use posts
  const desktop = useDesktop();

  // action
  const [space, action] = props.path.split('/');

  console.log('test ssssssssssssssss', space, action, props.path);

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

      menu={ false ? (
        <SideBar
          item={ props.item }
          feed={ feed }
          space={ null }
          onFeed={ saveFeed }
          subSpace={ subSpace }
          subSpaces={ subSpaces }
          setSubSpace={ saveSubspace }
          bringToFront={ props.bringToFront }
        />
      ) : null }

      ready={ true }
      default={ defaultProps }
    >
      <>
        { (space === 'create') ? (
          <Create
            onClose={ props.onClose }
            bringToFront={ props.bringToFront }
          />
        ) : (['mooning', 'latest', 'account'].includes(space)) ? (
          <List
            feed={ space }
            onClose={ props.onClose }
            bringToFront={ props.bringToFront }
          />
        ) : (!null) ? (
          <Box>
            Route not found
          </Box>
        ) : (action === 'create') ? (
          <SubSpaceCreate
            space={ null }
            onClose={ props.onClose }
            bringToFront={ props.bringToFront }
          />
        ) : (
          <Box flex={ 1 }>
            <Feed
              feed={ feed }
              space={ null }
              onFeed={ saveFeed }
              subSpace={ subSpace }
              subSpaces={ subSpaces }
              setSubSpace={ saveSubspace }
              bringToFront={ props.bringToFront }
            />
          </Box>
        ) }
      </>
    </App>
  );
};

// export default
export default SpaceApp;