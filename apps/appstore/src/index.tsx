
// import react app
import React from 'react';
import { App, ScrollBar, Route } from '@moonup/ui';
import { Box, Stack, Chip, Divider, useTheme, MenuList, MenuItem, ListItemIcon, ListItemText, TextField } from '@mui/material';

// import css
import 'react-alice-carousel/lib/alice-carousel.css';

// font awesome icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faRss, faUsers, faUpDown } from '@fortawesome/pro-regular-svg-icons';

// local dependencies
import Items from './Items';
import useTags from './useTags';
import AppStoreApp from './App';

/**
 * create space app
 *
 * @param props
 */
const SpaceApp = (props = {}) => {
  // theme
  const tag = useTags();
  const theme = useTheme();

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
    props.pushPath(`/app/${item.id}`);
  };

  // return jsx
  return (
    <App
      name="Moon Appstore"

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
        <Box sx={ {
          padding      : 2,
          borderBottom : `${theme.shape.borderWidth} solid ${theme.palette.divider}`,
        } }>
          <ScrollBar>
            <Stack direction="row" spacing={ 1 } sx={ {
              display    : 'inline-flex',
              alignItems : 'center',
            } }>
              <TextField
                size="small"
                placeholder="Search"
              />
              <Divider />
              { tag.tags.map((data) => {
                // return jsx
                return (
                  <Chip
                    key={ data.id }
                    label={ data.name }
                  />
                );
              }) }
            </Stack>
          </ScrollBar>
        </Box>
        <Box flex={ 1 } display="flex">
          <ScrollBar isFlex>
            <Items name="Featured Apps" onSelect={ onSelect } />
            <Items name="Most Followed Apps" size="small" sort="count.followers" onSelect={ onSelect } />
            <Items name="Most Installed Apps" size="small" sort="count.installs" onSelect={ onSelect } />
          </ScrollBar>
        </Box>
      </Route>

      <Route path="/latest">
        <Box>
          Latest
        </Box>
      </Route>

      <Route path="/following">
        <Box>
        Following
        </Box>
      </Route>

      <Route path="/installed">
        <Box>
        Installed
        </Box>
      </Route>

      <Route path="/app/:id">
        <AppStoreApp />
      </Route>
    </App>
  );
};

// export default
export default SpaceApp;