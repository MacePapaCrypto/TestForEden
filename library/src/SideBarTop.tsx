
// import dependencies
import Link from './Link';
import React, { useRef, useState } from 'react';
import Close from '@mui/icons-material/Close';
import ArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Box, Menu, MenuItem, useTheme, Typography, IconButton } from '@mui/material';

// nft side bar top
const NFTSideBarTop = (props = {}) => {
  // theme
  const theme = useTheme();
  const buttonRef = useRef(null);

  // use state
  const [menu, setMenu] = useState(false);

  // return jsx
  return (
    <>
      <Box height={ theme.spacing(6) } display="flex" alignItems="center" flexDirection="row">
        <Link to={ props.segment ? `/s/${props.segment?.id}` : `/a/${props.account?.id}` } sx={ {
          color  : theme.palette.text.primary,
          cursor : 'pointer',
        } }>
          <Typography variant="subtitle1" fontWeight="bold" sx={ {
            maxWidth     : theme.spacing(20),
            overflow     : 'hidden',
            whiteSpace   : 'nowrap',
            textOverflow : 'ellipsis',
          } }>
            { props.segment?.name || props.account?.name || props.account?.id }
          </Typography>
        </Link>
        <IconButton
          sx={ {
            marginLeft : 'auto',
          } }
          ref={ buttonRef }
          color="inherit"
          onClick={ () => setMenu(!menu) }
        >
          { menu ? <Close /> : <ArrowDown /> }
        </IconButton>
      </Box>

      <Menu
        open={ !!menu && !!buttonRef?.current }
        onClose={ () => setMenu(false) }
        anchorEl={ buttonRef?.current }
        anchorOrigin={ {
          vertical   : 'bottom',
          horizontal : 'right',
        } }
        transformOrigin={ {
          vertical   : 'top',
          horizontal : 'right',
        } }
        PaperProps={ {
          sx : {
            width      : theme.spacing(26),
            maxWidth   : theme.spacing(26),
            minWidth   : theme.spacing(26),
            background : theme.palette.background.default,
          }
        } }
      >
        <MenuItem onClick={ () => setMenu(false) }>Profile</MenuItem>
      </Menu>
    </>
  );
};

// export default
export default NFTSideBarTop;