
// import react
import { useHistory } from 'react-router-dom';
import React, { useRef, useState } from 'react';
import { Popper, Grow, Paper, MenuList, MenuItem, ClickAwayListener, Skeleton } from '@mui/material';
import { Box, Stack, Typography, IconButton, useTheme, ListItemIcon, ListItemText } from '@mui/material';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faAngleDown, faFire, faRss } from '@fortawesome/pro-regular-svg-icons';

// use local
import useSpaces from './useSpaces';

// sub spaces
const NFTSideBarSubspaces = (props = {}) => {
  // theme
  const theme = useTheme();
  const history = useHistory();

  // space menu
  const spaceMenuRef = useRef(null);
  const [spaceMenu, setSpaceMenu] = useState(false);

  // get browse
  const { browse } = props;

  // spaces
  const subSpaces = useSpaces({
    space        : browse?.space?.id,
    requireSpace : true,
  });

  // skeleton height
  const seketonHeight = `calc(36px - ${theme.spacing(.5)})`;

  // return jsx
  return (
    <>
      <Box sx={ {
        px     : theme.spacing(2),
        py     : theme.spacing(2),
        width  : props.width,
        height : '100vh',
      } }>
        { props.loading ? (
          <Skeleton variant="rectangular" height={ props.titleHeight } sx={ {
            minHeight : `${props.titleHeight}px`,
          } } />
        ) : (
          <Box sx={ {
            mb            : theme.spacing(1),
            cursor        : 'pointer',
            height        : props.titleHeight,
            display       : 'flex',
            alignItems    : 'center',
            flexDirection : 'row',
          } } ref={ spaceMenuRef } onClick={ () => setSpaceMenu(!spaceMenu) }>
            <Typography sx={ {
              maxWidth     : '80%',
              overflow     : 'hidden',
              whiteSpace   : 'nowrap',
              textOverflow : 'ellipsis',
            } }>
              { browse?.space?.name }
            </Typography>
            <IconButton sx={ {
              ml : 'auto',
            } }>
              <FontAwesomeIcon icon={ spaceMenu ? faTimes : faAngleDown } size="xs" />
            </IconButton>
          </Box>
        ) }

        <MenuList sx={ {
          py : 0,

          '& .MuiMenuItem-root' : {
            borderRadius : `${theme.shape.borderRadius}px`,
          }
        } }>
          <MenuItem selected={ !!(!browse.subSpace && browse.feed === 'hot') } onClick={ () => history.push(`/s/${browse.space?.id}/hot`) }>
            <ListItemIcon>
              <FontAwesomeIcon icon={ faFire } size="sm" />
            </ListItemIcon>
            <ListItemText>
              Hot
            </ListItemText>
          </MenuItem>
          <MenuItem selected={ !!(!browse.subSpace && browse.feed === 'new') } onClick={ () => history.push(`/s/${browse.space?.id}/new`) }>
            <ListItemIcon>
              <FontAwesomeIcon icon={ faRss } size="sm" />
            </ListItemIcon>
            <ListItemText>
              New
            </ListItemText>
          </MenuItem>

          { (props.loading || subSpaces.loading) ? (
            <Stack sx={ {
              mb : 1,
              mt : 1.5,
            } } spacing={ .5 }>
              <Skeleton variant="rectangular" height={ seketonHeight } sx={ {
                minHeight : `${seketonHeight}px`,
              } } />
              <Skeleton variant="rectangular" height={ seketonHeight } sx={ {
                minHeight : `${seketonHeight}px`,
              } } />
              <Skeleton variant="rectangular" height={ seketonHeight } sx={ {
                minHeight : `${seketonHeight}px`,
              } } />
              <Skeleton variant="rectangular" height={ seketonHeight } sx={ {
                minHeight : `${seketonHeight}px`,
              } } />
            </Stack>
          ) : (
            <Box my={ 1 }>
              <Box height={ theme.spacing(.5) } width="100%" bgcolor={ theme.palette.background.default } />
            </Box>
          ) }

        </MenuList>
      </Box>

      <Popper
        open={ !!spaceMenu }
        anchorEl={ spaceMenuRef.current }
        placement="bottom"
        transition
        disablePortal
      >
        { ({ TransitionProps }) => (
          <Grow
            { ...TransitionProps }
            style={ {
              transformOrigin : 'top',
            } }
          >
            <Paper sx={ {
              width   : `calc(${props.width}px - ${theme.spacing(2)})`,
              bgcolor : theme.palette.background.default,
            } } elevation={ 2 }>
              <ClickAwayListener onClickAway={ () => setSpaceMenu(false) }>
                <MenuList>
                  <MenuItem onClick={ () => console.log('sup') }>
                    Space Config
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        ) }
      </Popper>
    </>
  )
};

// export default
export default NFTSideBarSubspaces;