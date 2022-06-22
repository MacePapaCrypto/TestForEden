
// import react app
import React from 'react';
import { App } from '@moonup/ui';
import { Box } from '@mui/material';

/**
 * create space app
 *
 * @param props
 */
const SpaceApp = (props = {}) => {

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

      menu={ (
        <Box>
          App Menu
        </Box>
      ) }

      ready={ true }
      default={ defaultProps }
    >
      <Box>
        Actual inner space
      </Box>
    </App>
  );
};

// export default
export default {
  name        : 'Moon Spaces',
  icon        : 'https://icon.com/icon.png',
  path        : '/',
  space       : 'spaceid',
  website     : 'https://moon.social',
  version     : '1.0.1',
  description : 'Spaces for Discussion',

  tags : [
    'Social',
  ],

  paths : [
    {
      path    : '/',
      name    : 'Explore Spaces',
      default : true,
    },
    {
      path : '/mine',
      name : 'My Spaces',
    },
    {
      path : '/trending',
      name : 'Trending Spaces',
    },
    {
      path : '/featured',
      name : 'Featured Spaces',
    },
    {
      path : '/latest',
      name : 'Latest Spaces',
    },
  ],

  socials : [
    {
      url  : 'https://twitter.com/bebis',
      type : 'twitter',
    },
    {
      url  : 'https://discord.com/bebis',
      type : 'discord',
    }
  ],

  // react
  react : SpaceApp,
};