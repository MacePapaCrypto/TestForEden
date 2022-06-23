import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '@moonup/ui';
import { AppBar, Chip, Box, Toolbar, IconButton, Typography, Menu, Container, Divider, Avatar, Button, Tooltip, MenuItem, useTheme } from '@mui/material';

// pages
const pages = ['Home'];

// main layout bar
const MainBar = (props = {}) => {
  // theme
  const auth = useAuth();
  const theme = useTheme();

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [userMenu, setUserMenu] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  // handle account click
  const onAccount = (e) => {
    // check logged in
    if (!auth.account) return auth.login();

    // open menu
    setUserMenu(e.currentTarget);
  };

  /**
   * logout
   *
   * @param e 
   * @returns 
   */
  const onLogout = (e) => {
    // close menu
    setUserMenu(null);

    // logout
    if (auth.account) return auth.logout();
  };

  // return account
  return (
    <>
      <AppBar
        position="static"
        elevation={ 0 }

        sx={ {
          background : 'transparent',
        } }
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={ {
                mr      : 2,
                display : {
                  xs : 'none',
                  md : 'flex',
                } } }
            >
              NFT
            </Typography>

            <Box sx={ {
              flexGrow : 1,
              display  : {
                xs : 'flex',
                md : 'none',
              }
            } }>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={ handleOpenNavMenu }
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={ anchorElNav }
                anchorOrigin={ {
                  vertical   : 'bottom',
                  horizontal : 'left',
                } }
                keepMounted
                transformOrigin={ {
                  vertical   : 'top',
                  horizontal : 'left',
                } }
                open={ !!anchorElNav }
                onClose={ handleCloseNavMenu }
                sx={ {
                  display : {
                    xs : 'block',
                    md : 'none',
                  },
                } }
              >
                <MenuItem>
                  <Typography textAlign="center">
                    Home
                  </Typography>
                </MenuItem>
                { !!auth.account && (
                  <MenuItem>
                    <Typography textAlign="center">
                      Profile
                    </Typography>
                  </MenuItem>
                ) }
              </Menu>
            </Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={ {
                flexGrow : 1,
                display  : {
                  xs : 'flex',
                  md : 'none',
                }
              } }
            >
              LOGO
            </Typography>
            <Box
              sx={ {
                flexGrow : 1,
                display  : {
                  xs : 'none',
                  md : 'flex',
                }
              } }
            >
              <Button
                sx={ {
                  my      : 2,
                  color   : 'white',
                  display : 'block',
                } }
              >
                Home
              </Button>
              { !!auth.account && (
                <Button
                  sx={ {
                    my      : 2,
                    color   : 'white',
                    display : 'block',
                  } }
                >
                  Profile
                </Button>
              ) }
            </Box>

            <Box sx={ {
              flexGrow : 0,
            } }>
              <Tooltip title={ auth.account || 'Connect Metamask' }>
                <Chip
                  avatar={ (
                    <Avatar alt="Remy Sharp">
                      { auth.account ? (
                        <PersonIcon />
                      ) : (
                        <AddIcon />
                      ) }
                    </Avatar>
                  ) }
                  label={ auth.account ? `${auth.account.substring(0, 8)}...` : 'Connect' }
                  variant="outlined"
                  onClick={ onAccount }
                />
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Menu
        sx={ {
          mt : '45px'
        } }
        id="menu-appbar"
        anchorEl={ userMenu }
        anchorOrigin={ {
          vertical   : 'top',
          horizontal : 'right',
        } }
        keepMounted
        transformOrigin={ {
          vertical   : 'top',
          horizontal : 'right',
        } }
        open={ !!userMenu }
        onClose={ () => setUserMenu(null) }
      >
        <MenuItem href="/profile">
          <Typography textAlign="center">
            My Profile
          </Typography>
        </MenuItem>

        <Divider />
        
        <MenuItem onClick={ onLogout }>
          <Typography textAlign="center">
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
export default MainBar;