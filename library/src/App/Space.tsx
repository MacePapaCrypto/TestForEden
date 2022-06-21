
import { Box, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';

// import local
import useSpaces from '../useSpaces';
import useDesktop from '../useDesktop';

// space elements
import Feed from './Space/Feed';
import List from './Space/List';
import Create from './Space/Create';
import SideBar from './Space/SideBar';
import SubSpaceCreate from './Space/SubSpaceCreate';

/**
 * moon app feed
 *
 * @param props 
 */
const MoonAppSpace = (props = {}) => {
  // use posts
  const desktop = useDesktop();

  // action
  const [space, action] = props.item.path.split('/');

  // spaces
  const subSpaces = useSpaces({
    space        : props.item.space,
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
    desktop.updateTask({
      id   : props.item?.id,
      path : `${space}/${feed}`,
    });
  };

  // save subspace
  const saveSubspace = async (subSpace) => {
    // set sub space
    setSubSpace(subSpace);

    // set new path
    desktop.updateTask({
      id   : props.item?.id,
      path : `${space}${subSpace?.id ? `/${subSpace.id}` : ''}`,
    });
  };

  // path change
  useEffect(() => {
    // action
    const [,action] = props.item.path.split('/');

    // set space
    setFeed(['hot', 'new'].find((t) => t === action));
    setSubSpace(subSpaces.spaces.find((s) => s.id === action));
  }, [props.item.path]);

  // use effect
  useEffect(() => {
    // check space
    if (subSpace) return;
    if (!subSpaces.spaces?.length) return;

    // set sub space
    setSubSpace(subSpaces.spaces.find((s) => s.id === action));
  }, [subSpaces.spaces?.length]);

  // return jsx
  return (
    <>
      { (space === 'create') ? (
        <Create
          onClose={ () => desktop.deleteTask(props.item) }
          bringToFront={ props.bringToFront }
        />
      ) : (['mooning', 'latest', 'account'].includes(space)) ? (
        <List
          feed={ space }
          onClose={ () => desktop.deleteTask(props.item) }
          bringToFront={ props.bringToFront }
        />
      ) : (!props.item.space?.id) ? (
        <Box>
          Route not found
        </Box>
      ) : (action === 'create') ? (
        <SubSpaceCreate
          item={ props.item }
          space={ props.item.space }
          onClose={ () => desktop.deleteTask(props.item) }
          bringToFront={ props.bringToFront }
        />
      ) : (
        <Box width="100%" height="100%" display="flex" flexDirection="row">
          <SideBar
            item={ props.item }
            feed={ feed }
            space={ props.item.space }
            onFeed={ saveFeed }
            subSpace={ subSpace }
            subSpaces={ subSpaces }
            setSubSpace={ saveSubspace }
            bringToFront={ props.bringToFront }
          />
          <Box flex={ 1 }>
            <Feed
              item={ props.item }
              feed={ feed }
              space={ props.item.space }
              onFeed={ saveFeed }
              subSpace={ subSpace }
              subSpaces={ subSpaces }
              setSubSpace={ saveSubspace }
              bringToFront={ props.bringToFront }
            />
          </Box>
        </Box>
      ) }
    </>
  );
}

// import moon app feed
export default MoonAppSpace;