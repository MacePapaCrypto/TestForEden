
import React, { useRef, useState } from 'react';
import { Box, Grow, Popper, Stack, Skeleton, Tooltip, Divider, Menu, MenuList, MenuItem, useTheme, ClickAwayListener, IconButton, Paper } from '@mui/material';

// auth
import Link from './Link';
import useAuth from './useAuth';
import useApps from './useApps';
import NFTAvatar from './NFT/Avatar';
import NFTPicker from './NFT/Picker';
import useSocket from './useSocket';
import useDesktop from './useDesktop';

// font awesome icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faSignIn, faSignOut } from '@fortawesome/pro-regular-svg-icons';

/**
 * create moon start menu
 *
 * @param props 
 * @returns 
 */
const MoonStartMenu = (props = {}) => {
  // theme
  const app = useApps();
  const auth = useAuth();
  const theme = useTheme();
  const socket = useSocket();
  const desktop = useDesktop();

  // ref
  const subMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  // use state
  const [loading, setLoading] = useState(null);
  const [subMenu, setSubMenu] = useState(null);
  const [avatarMenu, setAvatarMenu] = useState(false);

  // width
  const avatarWidth = theme.spacing(6).replace('px', '');
  const startMenuWidth = parseInt(theme.spacing(35).replace('px', ''));

  // on task
  const onTask = async (app, path) => {
    // set loading
    setLoading(true);
    setSubMenu(null);
    
    // task
    await desktop.findOrCreateTask({
      app,
      path,
    });

    // loading
    setLoading(false);
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

  // return jsx
  return (
    <>
      <Popper
        open={ !!props.open }
        anchorEl={ props.anchorEl }
        placement={ props.placement || 'top-start' }
        transition

        style={ {
          zIndex : 1498,
        } }
      >
        { ({ TransitionProps }) => (
          <Grow
            { ...TransitionProps }
            style={ {
              transformOrigin : 'left bottom',
            } }
          >
            <Paper sx={ {
              mb           : 1,
              ml           : 1,
              width        : startMenuWidth,
              border       : `${theme.shape.borderWidth} solid ${theme.palette.border.primary}`,
              height       : startMenuWidth * 1.5,
              background   : theme.palette.background.paper,
              borderRadius : `${theme.shape.borderRadius * 2}px`,

            } } elevation={ 1 }>
              <ClickAwayListener onClickAway={ () => avatarMenu || subMenu ? null : props.onClose() }>
                <Box height="100%" width="100%" display="flex" flexDirection="column">
                  <Stack sx={ {
                    flex         : 0,
                    width        : '100%',
                    display      : 'flex',
                    padding      : 2,
                    alignItems   : 'center',
                    borderBottom : `${theme.shape.borderWidth} solid ${theme.palette.border.primary}`,
                  } } spacing={ 2 } direction="row">
                    <Box sx={ {
                      cursor : 'pointer',
                    } } onClick={ (e) => {
                      // check auth
                      if (!auth.account) {
                        e.preventDefault();
                        return auth.login();
                      }

                      // pop up menu
                      setAvatarMenu(true);
                    } } ref={ userMenuRef }>
                      { auth.loading ? (
                        <Skeleton variant="circular" width={ avatarWidth } height={ avatarWidth } sx={ {
                          minHeight : `${avatarWidth}px`,
                        } } />
                      ) : (
                        <NFTAvatar user={ auth.user } width={ avatarWidth } height={ avatarWidth } sx={ {
                          color : `rgba(255, 255, 255, 0.25)`,
                        } } TooltipProps={ {
                          title     : auth.account ? 'My Profile' : 'Login',
                          placement : 'right',
                        } } />
                      ) }
                    </Box>
                    <Box flex={ 1 } flexDirection="column" alignItems="center">
                      { auth.account ? (
                        <Link to={ `/a/${auth.account}` }>
                          <Box component="span" sx={ {
                            ...(theme.typography.body1),

                            color      : theme.palette.text.primary,
                            fontWeight : theme.typography.fontWeightMedium,
                          } }>
                            { auth.account.toLowerCase() === '0x9d4150274f0a67985a53513767ebf5988cef45a4' ? 'eden' : 'not eden' }
                          </Box>
                        </Link>
                      ) : (
                        <Box component="span" sx={ {
                          ...(theme.typography.body1),

                          color      : theme.palette.text.primary,
                          fontWeight : theme.typography.fontWeightMedium,
                        } } onClick={ () => auth.login() }>
                          Anonymous
                        </Box>
                      ) }

                      { auth.account ? (
                        <Box component="a" target="_BLANK" href={ `https://ftmscan.com/address/${auth.account}` } color="rgba(255, 255, 255, 0.4)" sx={ {
                          ...theme.typography.body2,

                          display        : 'block',
                          textDecoration : 'none',
                        } }>
                          { `${auth.account.substring(0, 8)}` }
                        </Box>
                      ) : (
                        <Box color="rgba(255, 255, 255, 0.4)" sx={ {
                          ...theme.typography.body2,

                          textDecoration : 'none',
                        } }>
                          Anonymous
                        </Box>
                      ) }
                    </Box>

                    { auth.account ? (
                      <Tooltip title="Logout">
                        <IconButton onClick={ () => auth.logout() }>
                          <FontAwesomeIcon icon={ faSignOut } size="sm" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Login">
                        <IconButton onClick={ () => auth.login() }>
                          <FontAwesomeIcon icon={ faSignIn } size="sm" />
                        </IconButton>
                      </Tooltip>
                    ) }
                  </Stack>
                  <Box sx={ {
                    flex : 1,
                  } } ref={ subMenuRef }>
                    <MenuList>
                      { app.apps.map((app) => {
                        // return jsx
                        return (
                          <MenuItem
                            id={ `app-${app.id}` }
                            key={ `app-${app.id}` }
                            onClick={ () => setSubMenu(app.id) }
                            selected={ app.id === subMenu }
                          >
                            { app.name }
                            <Box ml="auto">
                              <FontAwesomeIcon icon={ faChevronRight } />
                            </Box>
                          </MenuItem>
                        );
                      }) }  
                    </MenuList>
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        ) }
      </Popper>

      { !!subMenu && (
        <Menu
          open={ !!subMenu }
          onClose={ () => setSubMenu(null) }
          anchorEl={ subMenuRef?.current }
          anchorOrigin={ {
            vertical   : 'top',
            horizontal : 'right',
          } }
          transformOrigin={ {
            vertical   : 'top',
            horizontal : 'left',
          } }

          MenuListProps={ {
            sx : {
              border       : `${theme.shape.borderWidth} solid ${theme.palette.border.primary}`,
              borderRadius : `${theme.shape.borderRadius}px`,
            }
          } }
        >
          { (app.apps.find((app) => app.id === subMenu)?.paths || []).map((item, i) => {

            // return jsx
            if (item === 'divider') return <Divider key={ `sub-${i}` } />;

            // return menu
            return (
              <MenuItem key={ `sub-${item.path}` } onClick={ () => onTask(subMenu, item.path) }>
                { item.name }
              </MenuItem>
            );
          }) }
        </Menu>
      ) }

      <NFTPicker
        open={ !!avatarMenu }
        title="Select New Avatar"
        onPick={ (nft) => onAvatar(nft) }
        onClose={ () => setAvatarMenu(false) }
        account={ auth.account }
        anchorEl={ userMenuRef.current }
        placement="right-end"
      />
    </>
  );
}

// export default
export default MoonStartMenu;