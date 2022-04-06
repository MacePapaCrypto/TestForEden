import { Box as NFTBox } from './';
import Tag from '@mui/icons-material/Tag';
import Share from '@mui/icons-material/Share';
import Forum from '@mui/icons-material/Forum';
import ThumbUpOffAlt from '@mui/icons-material/ThumbUpOffAlt';
import ReactMarkdown from 'react-markdown';
import React, { useState } from 'react';
import { Box, Chip, Stack, Menu, MenuItem, Avatar, IconButton, Typography, useTheme } from '@mui/material';

// nft post
const NFTPost = (props = {}) => {
  // theme
  const theme = useTheme();

  // state
  const [share, setShare] = useState(false);

  // return jsx
  return (
    <NFTBox sx={ {
      flex : 1,
    } }>
      <Stack spacing={ 1 } flex={ 1 }>
        { /* POST USER `*/ }
        <Stack spacing={ 2 } direction="row">
          <Avatar alt="User 1" src={ null } sx={ {
            width  : 50,
            height : 50,
          } } />
        </Stack>
        { /* / POST USER */ }

        { /* EMBED */ }
        { !!props.embed && (
          <Box>
            { props.embed }
          </Box>
        ) }
        { /* / EMBED */ }

        { /* POST BODY */ }
        <Box
          sx={ {
            '& > p' : {
              ...theme.typography.body2,
              my : 0,
            },
          } }
        >
          <ReactMarkdown>
            { props.body || 'N/A BODY' }
          </ReactMarkdown>
        </Box>
        { /* / POST BODY */ }

        { /* POST SHARE LINE */ }
        <Box pt={ 0 }>
          <Stack
            spacing={ 2 }
            direction="row"
            alignItems="center"
            justifyContent="space-between"

            sx={ {
              mt    : 0,
              color : theme.palette.mode === 'dark' ? 'grey.700' : 'grey.800'
            } }
          >
            <Stack direction="row" spacing={ 1 } sx={ {
              flex : 1,

              '& > .MuiChip-root' : {
                background : `rgba(0, 0, 0, 0.4)`,
              }
            } }>
              <Chip icon={ (
                <Tag />
              ) } label="Chip Outlined" size="small" />
              <Chip icon={ (
                <Tag />
              ) } label="Chip Outlined" size="small" />
              <Chip icon={ (
                <Tag />
              ) } label="Chip Outlined" size="small" />
            </Stack>

            <Stack direction="row" spacing={ 1 }>
              <IconButton onClick={ (e) => setShare(e.target) } variant="text" size="small">
                <Forum size="small" />
              </IconButton>
              <IconButton onClick={ (e) => setShare(e.target) } variant="text" size="small">
                <ThumbUpOffAlt size="small" />
              </IconButton>
              <IconButton onClick={ (e) => setShare(e.target) } variant="text" size="small">
                <Share size="small" />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
        { /* / POST SHARE LINE */ }
      </Stack>

      <Menu
        id="menu-post"
        open={ !!share }
        variant="selectedMenu"
        onClose={ () => setShare(false) }
        anchorEl={ share }
        keepMounted
        anchorOrigin={ {
          vertical   : 'bottom',
          horizontal : 'right'
        } }
        transformOrigin={ {
          vertical   : 'top',
          horizontal : 'right'
        } }
        sx={ {
          '& .MuiSvgIcon-root': {
            fontSize    : '1.25rem',
            marginRight : '14px',
          }
        } }
      >
        <MenuItem onClick={ () => setShare(false) }>
          <Share fontSize="inherit" /> Share Now
        </MenuItem>
        <MenuItem onClick={ () => setShare(false) }>
          <Share fontSize="inherit" /> Share to Friends
        </MenuItem>
        <MenuItem onClick={ () => setShare(false) }>
          <Share fontSize="inherit" /> Send in Messanger
        </MenuItem>
        <MenuItem onClick={ () => setShare(false) }>
          <Share fontSize="inherit" /> Copy Link
        </MenuItem>
      </Menu>
    </NFTBox>
  );
};

// export default
export default NFTPost;