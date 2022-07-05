// import
import React from 'react';
import { MenuList, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';

// font awesome icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faRss, faUsers, faPlus } from '@fortawesome/pro-regular-svg-icons';

const SpaceAppExploreSideBar = (props = {}) => {

  return (
    <MenuList>
      <MenuItem selected={ props.path === '/' } onClick={ () => props.pushPath('/') }>
        <ListItemIcon>
          <FontAwesomeIcon icon={ faFire } size="sm" />
        </ListItemIcon>
        <ListItemText>
          Home
        </ListItemText>
      </MenuItem>
      <MenuItem selected={ props.path === '/latest' } onClick={ () => props.pushPath('/latest') }>
        <ListItemIcon>
          <FontAwesomeIcon icon={ faRss } size="sm" />
        </ListItemIcon>
        <ListItemText>
          Latest
        </ListItemText>
      </MenuItem>
      <MenuItem selected={ props.path === '/following' } onClick={ () => props.pushPath('/following') }>
        <ListItemIcon>
          <FontAwesomeIcon icon={ faUsers } size="sm" />
        </ListItemIcon>
        <ListItemText>
          Following
        </ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={ () => props.pushPath('/create') }>
        <ListItemIcon>
          <FontAwesomeIcon icon={ faPlus } size="sm" />
        </ListItemIcon>
        <ListItemText>
          Create Space
        </ListItemText>
      </MenuItem>
    </MenuList>
  );
};

// export default
export default SpaceAppExploreSideBar;