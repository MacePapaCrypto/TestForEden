import React from 'react';
import { App, Route, ScrollBar, useThemes } from '@moonup/ui';
import { Box, Divider, MenuList, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Deploy from './components/deploy/Deploy';
import LandingPage from './components/landing/LandingPage';
import Manage from './components/manage/Manage';
import './App.css';
import DeploySteps from './components/deploy/DeploySteps';

const NFTLaunchpad = (props = {}) => {  

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
  
  return (
    <App
      name="NFT Launchpad"
      menu={(
        <MenuList>
          <MenuItem selected={ props.path === '/' } onClick={ () => props.pushPath('/') }>
            <ListItemIcon>
              <FontAwesomeIcon icon={ ['fad', 'house'] } />
            </ListItemIcon>
            <ListItemText>
              Home
            </ListItemText>
          </MenuItem>
          <MenuItem selected={ props.path === '/deploy' } onClick={ () => props.pushPath('/deploy') }>
            <ListItemIcon>
              <FontAwesomeIcon icon={ ['fad', 'rocket'] } />
            </ListItemIcon>
            <ListItemText>
              Deploy
            </ListItemText>
          </MenuItem>
          <MenuItem selected={ props.path === '/manage' } onClick={ () => props.pushPath('/manage') }>
            <ListItemIcon>
              <FontAwesomeIcon icon={ ['fad', 'toolbox'] } />
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
      <Route path='/'>
        <LandingPage { ...props } />
      </Route>
      <Route path='/deploy'>
        <Deploy { ...props } />
      </Route>
      <Route path='/manage'>
        <Manage { ...props } />
      </Route>
      <Route path="/deploy/:id">
        <DeploySteps { ...props } />
      </Route>
    </App>
  );
}

export default NFTLaunchpad;


