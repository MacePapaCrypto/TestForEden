
// import react
import { useHistory } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React, { useRef, useState } from 'react';
import { Popper, Grow, Paper, MenuList, MenuItem, ClickAwayListener, Skeleton } from '@mui/material';
import { Box, Stack, Typography, IconButton, useTheme, ListItemIcon, ListItemText } from '@mui/material';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faAngleDown, faFire, faRss, faPlus, faGalleryThumbnails } from '@fortawesome/pro-regular-svg-icons';

// use local
import useAcls from './useAcls';
import useSpaces from './useSpaces';
import useMember from './useMember';

// import
import SubSpaceModal from './SubSpaceModal';
import SideBarSubSpace from './SideBarSubSpace';

// sub spaces
const NFTSideBarSubSpaces = (props = {}) => {
  // get browse
  const { browse } = props;

  // theme
  const theme = useTheme();
  const member = useMember(browse?.space, browse?.space?.member);
  const history = useHistory();

  // create can function
  const can = useAcls(browse?.space, member.member);

  // space menu
  const spaceMenuRef = useRef(null);
  const [updated, setUpdated] = useState(new Date());
  const [creating, setCreating] = useState(null);
  const [spaceMenu, setSpaceMenu] = useState(false);

  // spaces
  const subSpaces = useSpaces({
    space        : browse?.space?.id,
    requireSpace : true,
  });

  // on subspace
  const onSubSpace = (subSpace) => {
    // set subspace
    browse.setSubSpace(subSpace);

    // push
    history.push(`/s/${subSpace.id}`);
  };

  // order space
  const onOrderSave = async () => {
    // do updates
    subSpaces.updates();
  };

  // order space
  const onOrderSpace = (dragIndex, hoverIndex) => {
    // get spaces
    const spaces = getSortedSpaces();

    // swap order
    const dragOrder = spaces[dragIndex].order;
    const hoverOrder = spaces[hoverIndex].order;

    // set orders
    spaces[dragIndex].order = hoverOrder;
    spaces[hoverIndex].order = dragOrder;

    // updated
    setUpdated(new Date());
  };

  // get sorted parts
  const getSortedSpaces = (spaces = subSpaces.spaces) => {
    // sort
    return spaces.sort((a, b) => {
      // order
      const aO = a.order || 0;
      const bO = b.order || 0;
  
      // return
      if (aO < bO) return -1;
      if (aO > bO) return 1;
      return 0;
    }).map((item, i) => {
      // set order
      item.order = i;
      return item;
    });
  };

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

        <DndProvider backend={ HTML5Backend }>
          <MenuList sx={ {
            py : 0,

            '& .MuiMenuItem-root' : {
              borderRadius : `${theme.shape.borderRadius}px`,
            }
          } }>
            <MenuItem selected={ !!(!browse.subSpace && browse.feed === 'hot') } onClick={ () => history.push(`/${browse.space?.id ? 's' : 'a'}/${browse.space?.id || browse.account?.id}/hot`) }>
              <ListItemIcon>
                <FontAwesomeIcon icon={ faFire } size="sm" />
              </ListItemIcon>
              <ListItemText>
                Hot
              </ListItemText>
            </MenuItem>
            <MenuItem selected={ !!(!browse.subSpace && browse.feed === 'new') } onClick={ () => history.push(`/${browse.space?.id ? 's' : 'a'}/${browse.space?.id || browse.account?.id}/new`) }>
              <ListItemIcon>
                <FontAwesomeIcon icon={ faRss } size="sm" />
              </ListItemIcon>
              <ListItemText>
                New
              </ListItemText>
            </MenuItem>
            { !!browse.account && (
              <MenuItem selected={ !!(!browse.subSpace && browse.feed === 'nft') } onClick={ () => history.push(`/${browse.space?.id ? 's' : 'a'}/${browse.space?.id || browse.account?.id}/nft`) }>
                <ListItemIcon>
                  <FontAwesomeIcon icon={ faGalleryThumbnails } size="sm" />
                </ListItemIcon>
                <ListItemText>
                  NFTs
                </ListItemText>
              </MenuItem>
            ) }

            { (props.loading || subSpaces.loading === 'list') ? (
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

            { !(props.loading || subSpaces.loading === 'list') && (
              getSortedSpaces().map((subSpace, index) => {
                // return jsx
                return (
                  <SideBarSubSpace
                    can={ can }
                    key={ subSpace.id }
                    item={ subSpace }
                    index={ index }
                    onEnd={ onOrderSave }
                    browse={ browse }
                    onMove={ onOrderSpace }
                    onSelect={ onSubSpace }
                  />
                );
              })
            ) }

            { !!can('subspace:create') && (
              <MenuItem onClick={ () => setCreating({}) }>
                <ListItemIcon>
                  <FontAwesomeIcon icon={ faPlus } size="sm" />
                </ListItemIcon>
                <ListItemText>
                  Create Sub
                </ListItemText>
              </MenuItem>
            ) }

          </MenuList>
        </DndProvider>
      </Box>

      <SubSpaceModal
        open={ !!creating }
        item={ creating }
        mixin={ subSpaces }
        browse={ browse }
        onClose={ () => setCreating(null) }
      />

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
export default NFTSideBarSubSpaces;