
import { useHistory } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React, { useRef, useState } from 'react';
import { useTheme, Box, Stack, Tooltip, Avatar, CircularProgress } from '@mui/material';
import { Popper, Grow, Paper, ClickAwayListener, MenuList, MenuItem, Divider, Skeleton } from '@mui/material';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser } from '@fortawesome/pro-regular-svg-icons';

// local
import Link from './Link';
import Logo from './assets/logo.png';
import useAuth from './useAuth';
import NFTAvatar from './NFTAvatar';
import useSocket from './useSocket';
import ScrollBar from './ScrollBar';
import NFTPicker from './NFTPicker';
import SpaceModal from './SpaceModal';
import SideBarSpace from './SideBarSpace';

// empty elements
let timeout, dragging, grouping;

// nft sidebar spaces
const NFTSideBarSpaces = (props = {}) => {
  // theme
  const auth = useAuth();
  const theme = useTheme();
  const socket = useSocket();
  const history = useHistory();

  // get mixin
  const { browse, mixin } = props;
  const { space } = browse;
  let { spaces } = mixin;

  // menu
  const userMenuRef = useRef(null);
  const [userMenu, setUserMenu] = useState(false);
  const [avatarMenu, setAvatarMenu] = useState(false);

  // create
  const [updating, setUpdating] = useState(null);

  // updated
  const [updated, setUpdated] = useState(new Date());

  // set dragging
  const setDragging = (d) => {
    // check return
    if (d?.id === dragging?.id) return;
    
    // set
    dragging = d;
    setUpdated(new Date());
  };
  const setGrouping = (g) => {
    // check return
    if (g?.id === grouping?.id) return;
    
    // set
    grouping = g;
    setUpdated(new Date());
  };

  // open
  const toggleGroupOpen = (group) => {
    // set open
    group.open = group.open ? false : new Date();

    // update
    mixin.groupUpdate(group);
  };

  // set drag place
  const setDragPlace = (id, parent, order) => {
    // check dragging
    if (!dragging) return;

    // get actual dragging
    const actualDragging = spaces.find((seg) => seg.id === dragging.id);

    // check dragging again
    if (!actualDragging) return;

    // is group
    const over    = spaces.find((seg) => seg.id === id);
    const aParent = spaces.find((g) => g.id === parent)?.type === 'spaceGroup' ? spaces.find((g) => g.id === parent) : null;

    // check default variables
    if (actualDragging.id === id) return;
    if (actualDragging.id === parent) return;
    if (actualDragging.parent === parent && actualDragging.order === order) return;

    // clear timeout
    clearTimeout(timeout);
    
    // debounce
    timeout = setTimeout(() => {
      // check default variables
      if (actualDragging.id === id) return;
      if (actualDragging.id === parent) return;
      if (grouping && (grouping.id === parent)) return;
      if (actualDragging.parent === parent && actualDragging.order === order) return;

      // set order
      actualDragging.order = order;

      // check over
      if (!aParent && over?.type !== 'spaceGroup' && parent) {
        // grouping over
        actualDragging.parent = over.id;
        setGrouping(over);
      } else {
        // not grouping
        setGrouping(null);

        // set parent
        if (aParent && over?.type !== 'spaceGroup') {
          actualDragging.parent = aParent.id;
        } else if (over?.type === 'spaceGroup' && parent) {
          actualDragging.parent = over.id;
        } else {
          actualDragging.parent = null;
        }
      }

      // update
      mixin.update(actualDragging, false);
    }, parent && !aParent ? 500 : 1);
  };

  // save drag place
  const saveDragPlace = async () => {
    // clear timeout
    clearTimeout(timeout);

    // check draging
    if (!dragging) return;

    // force update
    mixin.update(dragging, false);

    // create group if grouping
    if (grouping) {
      // create
      const tempGroup = await mixin.groupCreate({
        order : grouping.order,
      });

      // set parents
      dragging.order  = grouping.order + .5;
      grouping.parent = tempGroup.id;
      dragging.parent = tempGroup.id;

      // update
      mixin.update(tempGroup, false);

      // updated
      setGrouping(null);
    }

    // remove all single parent groups
    const allGroups = spaces.filter((s) => !!s.parent).reduce((accum, space) => {
      // check parent
      if (!accum[space.parent]) accum[space.parent] = [];

      // push id
      accum[space.parent].push(space.id);

      // return done
      return accum;
    }, {});

    // loop
    await Promise.all(Object.keys(allGroups).map((groupId) => {
      // check length
      if (allGroups[groupId].length > 1) return;

      // get group
      const actualGroup = spaces.find((s) => s.id === groupId);
      
      // remove from parent
      return Promise.all(allGroups[groupId].map((spaceId) => {
        // get space
        const actualSpace = spaces.find((s) => s.id === spaceId);

        // set parent
        actualSpace.order = actualGroup.order;
        actualSpace.parent = null;

        // remove group
        return mixin.groupRemove(actualGroup);
      }));
    }));

    // new groups
    spaces.sort((a, b) => {
      // sort
      if ((a.order || 0) > (b.order || 0)) return 1;
      if ((a.order || 0) < (b.order || 0)) return -1;
      return 0;
    }).forEach((item, order) => {
      item.order = order;
    });

    // promise all
    await mixin.updates(spaces);

    // set updated
    setDragging(null);
  };

  // on select
  const onAvatar = async (nft) => {
    // check nft
    if (!nft) return;
    
    // loading
    setAvatarMenu(false);

    // set nft
    const account = await socket.post(`/account/update`, {
      avatar : nft.id,
    });

    // auth
    auth.emitUser(account);
  };

  // get sorted parts
  const getSortedSpaces = () => {
    // sort
    return spaces.sort((a, b) => {
      // order
      const aO = a.order || 0;
      const bO = b.order || 0;
  
      // return
      if (aO < bO) return -1;
      if (aO > bO) return 1;
      return 0;
    }).filter((s) => !s.parent);
  };

  // width
  const spaceWidth = theme.spacing(6).replace('px', '');

  // return jsx
  return (
    <>
      <Box width={ theme.spacing(10) } display="flex" height="100vh" sx={ {
        borderRight : `${theme.spacing(.5)} solid ${theme.palette.background.default}`,
      } }>
        <ScrollBar isFlex>
          <Stack spacing={ 1 } sx={ {
            px        : theme.spacing(1.75),
            py        : theme.spacing(2),
            minHeight : `100vh`,
          } }>

            { /* HOME SPACE */ }
            <Box sx={ {
              cursor : 'pointer',
            } } onClick={ () => browse.setSpace(null) }>
              <Link to="/">
                <Tooltip title="Home Space" placement="right">
                  <Avatar sx={ {
                    width  : `${spaceWidth}px`,
                    height : `${spaceWidth}px`,
                  } } src={ Logo } />
                </Tooltip>
              </Link>
            </Box>

            { /* FLOATING SPACE */ }
            { !!space && !(spaces || []).find((s) => s.id === space.id) && (
              <SideBarSpace
                item={ space }

                active={ space }
                loading={ !!browse.loading }

                onActive={ browse.setSpace }
                isActive
                isTemporary
              />
            ) }
            
            { /* TETHERED SPACES */ }
            <DndProvider backend={ HTML5Backend }>
              { getSortedSpaces().map((child) => {
                // return jsx
                return (
                  <SideBarSpace
                    key={ child.id }
                    item={ child }

                    active={ space }
                    spaces={ spaces }
                    loading={ mixin.loading }

                    onActive={ browse.setSpace }
                    setPlace={ setDragPlace }
                    dragging={ dragging }
                    grouping={ grouping }
                    isActive={ space?.id === child.id }
                    savePlace={ saveDragPlace }
                    isLoading={ mixin.loading === child.id }
                    isGrouping={ grouping?.id === child.id }
                    isDragging={ !!dragging }
                    toggleOpen={ toggleGroupOpen }
                    setDragging={ setDragging }
                    isDraggable

                  />
                );
              }) }
            </DndProvider>

            { /* CREATE SPACE */ }
            <Box sx={ {
              cursor : 'pointer',
            } } onClick={ () => setUpdating({}) }>
              { mixin.loading ? (
                <Skeleton variant="circular" width={ spaceWidth } height={ spaceWidth } sx={ {
                  minHeight : `${spaceWidth}px`,
                } } />
              ) : (
                <Tooltip title="Create Space" placement="right">
                  <Avatar sx={ {
                    color      : `rgba(255, 255, 255, 0.25)`,
                    width      : `${spaceWidth}px`,
                    height     : `${spaceWidth}px`,
                    cursor     : 'pointer',
                    bgcolor    : `rgba(255,255,255,0.1)`,
                    transition : `all 0.2s ease`,
  
                    '&:hover' : {
                      bgcolor : theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[600],
                    },
                    '& .MuiCircularProgress-svg' : {
                      color : `${theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[600]}!important`,
                    }
                  } }>
                    <FontAwesomeIcon icon={ faPlus } />
                  </Avatar>
                </Tooltip>
              ) }
            </Box>

            { /* PROFILE SPACE */ }
            <Box sx={ {
              mt     : 'auto!important',
              cursor : 'pointer',
            } } onClick={ (e) => {
              // check auth
              if (!auth.account) {
                e.preventDefault();
                return auth.login();
              }

              // pop up menu
              setUserMenu(true);
            } } ref={ userMenuRef }>
              { auth.loading ? (
                <Skeleton variant="circular" width={ spaceWidth } height={ spaceWidth } sx={ {
                  minHeight : `${spaceWidth}px`,
                } } />
              ) : (
                <NFTAvatar user={ auth.authed } width={ spaceWidth } height={ spaceWidth } sx={ {
                  color : `rgba(255, 255, 255, 0.25)`,
                } } TooltipProps={ {
                  title     : auth.account ? 'My Profile' : 'Login',
                  placement : 'right',
                } } />
              ) }
            </Box>


          </Stack>
        </ScrollBar>
      </Box>

      

      <Popper
        open={ !!userMenu }
        anchorEl={ userMenuRef.current }
        placement="right-end"
        transition
        disablePortal
      >
        { ({ TransitionProps }) => (
          <Grow
            { ...TransitionProps }
            style={ {
              transformOrigin : 'left bottom',
            } }
          >
            <Paper>
              <ClickAwayListener onClickAway={ () => setUserMenu(null) }>
                <MenuList>
                  <MenuItem onClick={ () => history.push(`/a/${auth.account}`) }>Profile</MenuItem>
                  <MenuItem onClick={ () => {
                    setUserMenu(null);
                    setAvatarMenu(true);
                  } }>Avatar</MenuItem>
                  <Divider />
                  <MenuItem onClick={ () => auth.logout() }>Logout</MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        ) }
      </Popper>

      <NFTPicker
        open={ !!avatarMenu }
        title="Select New Avatar"
        onPick={ (nft) => onAvatar(nft) }
        onClose={ () => setAvatarMenu(false) }
        account={ auth.account }
        anchorEl={ userMenuRef.current }
        placement="right-end"
      />

      <SpaceModal
        open={ !!updating }
        item={ updating }
        mixin={ props.mixin }
        browse={ browse }
        onClose={ () => setUpdating(null) }
      />

    </>
  );
}

// export default
export default NFTSideBarSpaces;