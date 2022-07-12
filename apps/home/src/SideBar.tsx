
// import react
import React from 'react';
import { useSpaces } from '@moonup/ui';
import { ListItemIcon, ListItemText } from '@mui/material';
import { MenuList, MenuItem, Divider } from '@mui/material';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faHome, faUsers } from '@fortawesome/pro-regular-svg-icons';

// sub spaces
const HomeAppSideBar = (props = {}) => {
  // use spaces
  const space = useSpaces();

  console.log(space);

  // return jsx
  return (
    <MenuList sx={ {
      py : 0,
    } }>
      <MenuItem selected={ props.path === '/' } onClick={ () => props.pushPath('/') }>
        <ListItemIcon>
          <FontAwesomeIcon icon={ faHome } size="sm" />
        </ListItemIcon>
        <ListItemText>
          For You
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
      <MenuItem selected={ props.path === '/hot' } onClick={ () => props.pushPath('/hot') }>
        <ListItemIcon>
          <FontAwesomeIcon icon={ faFire } size="sm" />
        </ListItemIcon>
        <ListItemText>
          What's Hot
        </ListItemText>
      </MenuItem>

      <Divider />

      { space.spaces.map((space) => {
        // return jsx
        return (
          <MenuItem key={ space.id } selected={ props.path === '/hot' } onClick={ () => props.pushPath('/hot') }>
            <ListItemIcon>
              <FontAwesomeIcon icon={ faFire } size="sm" />
            </ListItemIcon>
            <ListItemText>
              { space.name }
            </ListItemText>
          </MenuItem>
        );
      }) }
    </MenuList>
  )
};

// export default
export default HomeAppSideBar;