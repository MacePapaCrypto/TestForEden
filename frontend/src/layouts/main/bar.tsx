import React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import AddReaction from '@mui/icons-material/AddReaction';
import { useAuth } from '@nft/ui';
import { AppBar, Chip, Box, Toolbar, IconButton, Typography, Menu, Container, Avatar, Button, Tooltip, MenuItem, useTheme } from '@mui/material';

// pages
const pages = ['Home'];

// settings
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

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
  const handleAccountClick = (e) => {
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
  const handleLogoutClick = (e) => {
    // close menu
    setUserMenu(null);

    // logout
    if (auth.account) return auth.logout();
  };

  // return account
  return (
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
              anchorEl={anchorElNav}
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
              { pages.map((page) => (
                <MenuItem key={ page } onClick={ handleCloseNavMenu }>
                  <Typography textAlign="center">
                    { page }
                  </Typography>
                </MenuItem>
              )) }
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
            { pages.map((page) => (
              <Button
                key={ page }
                onClick={ handleCloseNavMenu }
                sx={ {
                  my      : 2,
                  color   : 'white',
                  display : 'block',
                } }
              >
                { page }
              </Button>
            )) }
          </Box>

          <Box sx={ {
            flexGrow : 0,
          } }>
            <Tooltip title={ auth.account ? 'Open settings' : 'Connect Metamask' }>
              <Chip
                avatar={ (
                  <Avatar alt="Remy Sharp">
                    <AddReaction />
                  </Avatar>
                ) }
                label={ auth.account ? auth.account : 'Connect' }
                variant="outlined"
                onClick={ handleAccountClick }
              />
            </Tooltip>
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
              <MenuItem onClick={ handleLogoutClick }>
                <Typography textAlign="center">
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default MainBar;