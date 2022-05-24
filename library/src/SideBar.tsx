
// import react
import React from 'react';
import { Box, Stack, useTheme } from '@mui/material';

// local
import useBrowse from './useBrowse';
import useSpaces from './useSpaces';

// sidebar item
import SideBarSpaces from './SideBarSpaces';
import SideBarSubSpaces from './SideBarSubSpaces';

// nft sidebar
const NFTSideBar = (props = {}) => {
  // theme
  const theme = useTheme();
  const browse = useBrowse();
  const mySpace = useSpaces();

  // widths
  const subspaceWidth = parseInt(theme.spacing(30).replace('px', ''));
  const collapseWidth = parseInt(theme.spacing(10).replace('px', ''));

  // full width
  const fullWidth = subspaceWidth + collapseWidth;

  // as subspaces
  const hasSubspaces = !!((browse.space || browse.loadingSpace) || (browse.account || browse.loadingAccount));

  // return jsx
  return (
    <>
      <Box sx={ {
        top           : 0,
        width         : hasSubspaces ? fullWidth : collapseWidth,
        height        : '100vh',
        display       : 'flex',
        position      : 'sticky',
        background    : theme.palette.background.paper,
        transition    : 'all 0.2s ease',
        flexDirection : 'row',

        ...(props.sx || {}),
      } }>
        <SideBarSpaces
          width={ collapseWidth }
          mixin={ mySpace }
          browse={ browse }
        />

        <Box sx={ {
          width      : hasSubspaces ? subspaceWidth : 0,
          opacity    : hasSubspaces ? 1 : 0,
          overflow   : 'hidden',
          transition : 'all 0.2s ease',
        } }>
          { !!(browse.space || browse.account) && (
            <SideBarSubSpaces
              width={ subspaceWidth }
              mixin={ mySpace }
              browse={ browse }
              loading={ !!((!browse.space && browse.loadingSpace) || (!browse.account && browse.loadingAccount)) }
              titleHeight={ parseInt(theme.spacing(6).replace('px', '')) }
            />
          ) }
        </Box>
      </Box>
    </>
  );
};

// export default
export default NFTSideBar;