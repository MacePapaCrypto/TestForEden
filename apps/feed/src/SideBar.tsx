
// import react
import React from 'react';
import { MenuList, MenuItem } from '@mui/material';
import { ListItemIcon, ListItemText } from '@mui/material';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faRss, faUsers } from '@fortawesome/pro-regular-svg-icons';

// sub spaces
const FeedAppSideBar = (props = {}) => {
  // return jsx
  return (
    <MenuList sx={ {
      py : 0,
    } }>
      <MenuItem selected={ props.feed === 'hot' } onClick={ () => props.pushPath('/hot') }>
        <ListItemIcon>
          <FontAwesomeIcon icon={ faFire } size="sm" />
        </ListItemIcon>
        <ListItemText>
          Hot
        </ListItemText>
      </MenuItem>
      <MenuItem selected={ props.feed === 'latest' } onClick={ () => props.pushPath('/latest') }>
        <ListItemIcon>
          <FontAwesomeIcon icon={ faRss } size="sm" />
        </ListItemIcon>
        <ListItemText>
          Latest
        </ListItemText>
      </MenuItem>
      <MenuItem selected={ props.feed === 'following' } onClick={ () => props.pushPath('/following') }>
        <ListItemIcon>
          <FontAwesomeIcon icon={ faUsers } size="sm" />
        </ListItemIcon>
        <ListItemText>
          Following
        </ListItemText>
      </MenuItem>
    </MenuList>
  );
};

// export default
export default FeedAppSideBar;