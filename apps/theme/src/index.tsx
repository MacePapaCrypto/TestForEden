
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

  // on update
  const onUpdate = (theme) => {
    // update theme
    themes.update({
      id : themes.theme?.id,
      theme,
    });
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
          <MenuItem selected={ props.path === '/mine' } onClick={ () => props.pushPath('/mine') }>
            <ListItemIcon>
              <FontAwesomeIcon icon={ faUpDown } size="sm" />
            </ListItemIcon>
            <ListItemText>
              My Themes
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

      <Route path="/mine">
        <Box>
          Latest
        </Box>
      </Route>

      <Route path="/theme/:id">
        <ThemeStoreTheme />
      </Route>
    </App>
  );
};

// export default
export default ThemeApp;