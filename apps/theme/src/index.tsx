
// import react app
import React from 'react';
import { App, Route, ScrollBar, useThemes } from '@moonup/ui';
import { Box, Divider, MenuList, MenuItem, ListItemIcon, ListItemText } from '@mui/material';

// font awesome icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faUpDown } from '@fortawesome/pro-regular-svg-icons';

// local
import Items from './Items';
import ThemeStoreTheme from './Theme';
import ThemeStoreUpdate from './Update';
import ThemeStoreInstalled from './Installed';

/**
 * create space app
 *
 * @param props
 */
const ThemeApp = (props = {}) => {
  // themes
  const themes = useThemes();

  // default props
  const defaultProps = {
    position : {
      x : .1,
      y : .1,

      width  : .8,
      height : .8,
    },
  };

  // on select
  const onSelect = (item) => {
    // set path
    props.pushPath(`/theme/${item.id}`);
  };

  // return jsx
  return (
    <App
      name="Moon ThemeStore"

      menu={ (
        <MenuList>
          <MenuItem selected={ props.path === '/' } onClick={ () => props.pushPath('/') }>
            <ListItemIcon>
              <FontAwesomeIcon icon={ faFire } size="sm" />
            </ListItemIcon>
            <ListItemText>
              Home
            </ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem selected={ props.path === '/installed' } onClick={ () => props.pushPath('/installed') }>
            <ListItemIcon>
              <FontAwesomeIcon icon={ faUpDown } size="sm" />
            </ListItemIcon>
            <ListItemText>
              Installed
            </ListItemText>
          </MenuItem>
        </MenuList>
      ) }

      ready={ true }
      default={ defaultProps }
    >
      <Route path="/">
        <Box flex={ 1 } display="flex">
          <ScrollBar isFlex>
            <Items name="Featured Themes" onSelect={ onSelect } />
            <Items name="Most Followed Themes" size="small" sort="count.followers" onSelect={ onSelect } />
            <Items name="Most Installed Themes" size="small" sort="count.installs" onSelect={ onSelect } />
          </ScrollBar>
        </Box>
      </Route>

      <Route path="/create">
        <ThemeStoreUpdate { ...props } isCreate onSelect={ onSelect } />
      </Route>

      <Route path="/installed">
        <ThemeStoreInstalled { ...props } onSelect={ onSelect } />
      </Route>

      <Route path="/theme/:id">
        <ThemeStoreTheme { ...props } onSelect={ onSelect } />
      </Route>

      <Route path="/theme/:id/update">
        <ThemeStoreUpdate { ...props } onSelect={ onSelect } />
      </Route>
    </App>
  );
};

// export default
export default ThemeApp;