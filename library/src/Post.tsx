import { Box as NFTBox } from './';
import Share from '@mui/icons-material/Share';
import Forum from '@mui/icons-material/Forum';
import MoreVert from '@mui/icons-material/MoreVert';
import ThumbUpOffAlt from '@mui/icons-material/ThumbUpOffAlt';
import ReactMarkdown from 'react-markdown';
import React, { useState } from 'react';
import { Box, Grid, Stack, Menu, Button, MenuItem, Avatar, IconButton, Typography, useTheme } from '@mui/material';

// nft post
const NFTPost = (props = {}) => {
  // theme
  const theme = useTheme();

  // state
  const [menu, setMenu] = useState(false);
  const [share, setShare] = useState(false);

  // return jsx
  return (
    <NFTBox>
      <Stack spacing={ 2 }>

        { /* POST USER LINE */ }
        <Grid container wrap="nowrap" alignItems="center" spacing={ 2 }>
          <Grid item>
            <Avatar alt="User 1" src={ null } />
          </Grid>
          <Grid item xs zeroMinWidth>
            <Grid container alignItems="center" spacing={ 1 }>
              <Grid item>
                <Typography align="left" component="div" sx={ {
                  mb         : 0,
                  lineHeight : 1.1,
                  fontWeight : 'bold',
                } }>
                  Test Name
                </Typography>
                <Typography align="left" variant="caption" sx={ {
                  mb         : 0,
                  mt         : -.5,
                  lineHeight : 1.1,
                } }>
                  5m ago
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <IconButton sx={ {
              color : '#fff',
            } } onClick={ (e) => setMenu(e.target) } variant="text">
              <MoreVert />
            </IconButton>

            <Menu
              id="menu-post"
              open={ !!menu }
              onClose={ () => setMenu(false) }
              variant="selectedMenu"
              anchorEl={ menu }
              keepMounted
              anchorOrigin={ {
                vertical   : 'bottom',
                horizontal : 'right'
              } }
              transformOrigin={ {
                vertical   : 'top',
                horizontal : 'right'
              } }
            >
              <MenuItem onClick={ () => setMenu(false) }>Edit</MenuItem>
              <MenuItem onClick={ () => setMenu(false) }>Delete</MenuItem>
            </Menu>
          </Grid>
        </Grid>
        { /* / POST USER LINE */ }


        { /* POST BODY LINE */ }
        <Box
          sx={ {
            '& > p' : {
              ...theme.typography.body2,
              my : 0,
            }
          } }
        >
          <ReactMarkdown>
            POST BODY
          </ReactMarkdown>
        </Box>
        { /* POST BODY LINE */ }

        { /* POST SHARE LINE */ }
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={ 2 }

            sx={ {
              mt    : 0,
              color : theme.palette.mode === 'dark' ? 'grey.700' : 'grey.800'
            } }
          >
            <Stack direction="row" spacing={ 2 } sx={ {
              flex : 1,
            } }>
              <Button
                sx={ {
                  color : '#fff',
                } }
                size="small"
                variant="text"
                onClick={ () => {} }
                startIcon={ (
                  <ThumbUpOffAlt />
                ) }
              >
                { 5 }
                { ' ' }
                likes
              </Button>
              <Button
                sx={ {
                  color : '#fff',
                } }
                size="small"
                variant="text"
                onClick={ () => {} }
                startIcon={ (
                  <Forum />
                ) }
              >
                { 5 }
                { ' ' }
                comments
              </Button>
            </Stack>

            <IconButton onClick={ (e) => setShare(e.target) } variant="text" sx={ {
              color : '#fff',
            } } size="small">
              <Share />
            </IconButton>

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
          </Stack>
        </Box>
        { /* / POST SHARE LINE */ }
      </Stack>
    </NFTBox>
  );
};

// export default
export default NFTPost;