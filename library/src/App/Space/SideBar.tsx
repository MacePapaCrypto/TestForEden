
// import react
import { useHistory } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React, { useRef, useState } from 'react';
import { Popper, Grow, Paper, MenuList, MenuItem, ClickAwayListener, Skeleton } from '@mui/material';
import { Box, Stack, Typography, IconButton, useTheme, ListItemIcon, ListItemText } from '@mui/material';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faAngleDown, faFire, faRss, faPlus } from '@fortawesome/pro-regular-svg-icons';

// use local
import useAcls from '../../useAcls';
import useSpaces from '../../useSpaces';
import useMember from '../../useMember';
import useDesktop from '../../useDesktop';

// import
import SideBarSub from './SideBarSub';

// sub spaces
const MoonSpaceSideBar = (props = {}) => {
  // theme
  const theme = useTheme();
  const member = useMember(props.space?.id, props.space?.member);
  const desktop = useDesktop();

  // create can function
  const can = useAcls(props.space, member.member);

  // space menu
  const spaceMenuRef = useRef(null);
  const [updated, setUpdated] = useState(new Date());
  const [creating, setCreating] = useState(false);
  const [spaceMenu, setSpaceMenu] = useState(false);

  // on subspace
  const onSubSpace = (subSpace) => {
    // set subspace
    props.setSubSpace(subSpace);
  };

  // order space
  const onOrderSave = async () => {
    // do updates
    props.subSpaces.updates();
  };

  // create sub space
  const onCreateSubSpace = async () => {
    // creating
    setCreating(true);

    // create task
    await desktop.findOrCreateTask({
      type : 'space',
      path : `${props.space?.id}/create`,
    });

    // creating
    setCreating(false);
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
  const getSortedSpaces = (spaces = props.subSpaces.spaces) => {
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
        } } ref={ spaceMenuRef } onClick={ () => setSpaceMenu(!spaceMenu) }>
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
            <FontAwesomeIcon icon={ spaceMenu ? faTimes : faAngleDown } size="xs" />
          </IconButton>
        </Box>

        <DndProvider backend={ HTML5Backend }>
          <MenuList sx={ {
            py : 0,

            '& .MuiMenuItem-root' : {
              borderRadius : `${theme.shape.borderRadius}px`,
            }
          } }>
            <MenuItem selected={ !!(!props.subSpace && props.feed === 'hot') } onClick={ () => props.onFeed('hot') }>
              <ListItemIcon>
                <FontAwesomeIcon icon={ faFire } size="sm" />
              </ListItemIcon>
              <ListItemText>
                Hot
              </ListItemText>
            </MenuItem>
            <MenuItem selected={ !!(!props.subSpace && props.feed === 'new') } onClick={ () => props.onFeed('new') }>
              <ListItemIcon>
                <FontAwesomeIcon icon={ faRss } size="sm" />
              </ListItemIcon>
              <ListItemText>
                New
              </ListItemText>
            </MenuItem>
            
            <Box my={ 1 }>
              <Box borderTop={ `.1rem solid ${theme.palette.divider}` } />
            </Box>

            { (props.subSpaces.loading === 'list') && (
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
            ) }

            { !(props.subSpaces.loading === 'list') && (
              getSortedSpaces().map((subSpace, index) => {
                // return jsx
                return (
                  <SideBarSub
                    can={ can }
                    key={ subSpace.id }
                    item={ subSpace }
                    index={ index }
                    onEnd={ onOrderSave }
                    onMove={ onOrderSpace }
                    active={ props.subSpace?.id === subSpace.id }
                    onSelect={ onSubSpace }
                  />
                );
              })
            ) }

            { !!can('subspace:create') && (
              <MenuItem onClick={ onCreateSubSpace }>
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
              width   : `calc(${subspaceWidth}px - ${theme.spacing(2)})`,
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
export default MoonSpaceSideBar;