
// import react
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React, { useState } from 'react';
import { MenuList, MenuItem } from '@mui/material';
import { Box, useTheme, ListItemIcon, ListItemText, Typography, IconButton } from '@mui/material';

// icons
import { faAngleDown, faFire, faRss, faTimes, faUsers } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// use local
import useDesktop from '../../useDesktop';

// sub spaces
const MoonFeedSideBar = (props = {}) => {
  // theme
  const theme = useTheme();
  const desktop = useDesktop();

  // space menu
  const [updated, setUpdated] = useState(new Date());

  // skeleton height
  const seketonHeight = `calc(36px - ${theme.spacing(.5)})`;
  const subspaceWidth = parseInt(theme.spacing(30).replace('px', ''));

  // return jsx
  return (
    <>
      <Box sx={ {
        px          : theme.spacing(2),
        py          : theme.spacing(2),
        width       : subspaceWidth,
        height      : '100%',
        borderRight : `.1rem solid ${theme.palette.divider}`,
      } }>
        <Box sx={ {
          mb            : theme.spacing(1),
          cursor        : 'pointer',
          display       : 'flex',
          alignItems    : 'center',
          flexDirection : 'row',
        } }>
          <Typography sx={ {
            maxWidth     : '80%',
            overflow     : 'hidden',
            whiteSpace   : 'nowrap',
            textOverflow : 'ellipsis',
          } }>
            { props.item?.name }
          </Typography>
          <IconButton sx={ {
            ml : 'auto',
          } }>
            <FontAwesomeIcon icon={ false ? faTimes : faAngleDown } size="xs" />
          </IconButton>
        </Box>

        <DndProvider backend={ HTML5Backend }>
          <MenuList sx={ {
            py : 0,

            '& .MuiMenuItem-root' : {
              borderRadius : `${theme.shape.borderRadius}px`,
            }
          } }>
            <MenuItem selected={ props.feed === 'hot' } onClick={ () => props.onFeed('hot') }>
              <ListItemIcon>
                <FontAwesomeIcon icon={ faFire } size="sm" />
              </ListItemIcon>
              <ListItemText>
                Hot
              </ListItemText>
            </MenuItem>
            <MenuItem selected={ props.feed === 'latest' } onClick={ () => props.onFeed('latest') }>
              <ListItemIcon>
                <FontAwesomeIcon icon={ faRss } size="sm" />
              </ListItemIcon>
              <ListItemText>
                Latest
              </ListItemText>
            </MenuItem>
            <MenuItem selected={ props.feed === 'following' } onClick={ () => props.onFeed('following') }>
              <ListItemIcon>
                <FontAwesomeIcon icon={ faUsers } size="sm" />
              </ListItemIcon>
              <ListItemText>
                Following
              </ListItemText>
            </MenuItem>
          </MenuList>
        </DndProvider>
      </Box>
    </>
  )
};

// export default
export default MoonFeedSideBar;