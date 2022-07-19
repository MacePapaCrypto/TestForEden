import React from 'react';
import ReactDOM from 'react-dom/client';
import Launchpad from './Launchpad';
import { App, Route, ScrollBar, useThemes } from '@moonup/ui';
import { Box, Divider, MenuList, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import Deploy from './components/deploy/Deploy';
import LandingPage from './components/landing/LandingPage';
import Manage from './components/manage/Manage';

const NFTLaunchpad = (props = {}) => {
  function HomeIcon(props) {
    return (
      <SvgIcon {...props}>
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </SvgIcon>
    );
  }
  

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
  
  return (
    <App
      name="NFT Launchpad"
      menu={(
        <MenuList>
          <MenuItem selected={ props.path === '/' } onClick={ () => props.pushPath('/') }>
            <ListItemIcon>
              <HomeIcon color="action" size="sm" />
            </ListItemIcon>
            <ListItemText>
              Home
            </ListItemText>
          </MenuItem>
          <MenuItem selected={ props.path === '/deploy' } onClick={ () => props.pushPath('/deploy') }>
            <ListItemIcon>
              <HomeIcon color="action" size="sm" />
            </ListItemIcon>
            <ListItemText>
              Deploy
            </ListItemText>
          </MenuItem>
          <MenuItem selected={ props.path === '/manage' } onClick={ () => props.pushPath('/manage') }>
            <ListItemIcon>
              <HomeIcon color="action" size="sm" />
            </ListItemIcon>
            <ListItemText>
              Manage
            </ListItemText>
          </MenuItem>
        </MenuList>
        )}
        ready={ true }
        default={ defaultProps }
    >
      <div className="App">
        <Route path='/'>
          <LandingPage/>
        </Route>
        <Route path='/deploy'>
          <Deploy/>
        </Route>
        <Route path='/manage'>
          <Manage/>
        </Route>
      </div>
    </App>
  );
}

export default NFTLaunchpad;


