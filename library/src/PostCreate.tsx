
// import props
import Tag from '@mui/icons-material/Tag';
import Image from '@mui/icons-material/Image';
import useAuth from './useAuth';
import ShortText from '@mui/icons-material/ShortText';
import PostInput from './PostInput';
import VideoLibrary from '@mui/icons-material/VideoLibrary';
import LoadingButton from '@mui/lab/LoadingButton';
import React, { useState } from 'react';
import { Box, Chip, Stack, Avatar, Paper, AppBar, Tabs, Tab, Tooltip, useTheme, IconButton, Typography } from '@mui/material';

/**
 * create content
 *
 * @param props 
 */
const NFTPostCreate = (props = {}) => {
  // post type
  const auth = useAuth();
  const theme = useTheme();
  const types = ['text', 'image', 'video'];
  
  // open post
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('text');
  const [value, setValue] = useState('');
  const [focus, setFocus] = useState(false);
  const [reset, setReset] = useState(new Date());
  const [posting, setPosting] = useState(false);

  // on post
  const onPost = async (e) => {
    // prevent default
    if (e && e.preventDefault) e.preventDefault();

    // check disabled
    if (!(value || '').length) return;

    // set posting
    setPosting(true);

    // await props
    const success = await props.onPost({
      content : value,
    });

    // set posting
    if (success) setReset(new Date());
    setPosting(false);
  };

  // avatar width
  const avatarWidth = props.size === 'small' ? 40 : 50;

  // return jsx
  return (
    <Box sx={ {
      flex : 1,
    } }>
      <Stack spacing={ 2 } direction="row">
        { /* POST USER `*/ }
        <Box>
          <Tooltip title={ auth.authed?.avatar?.value?.name || auth.account || 'Anonymous' }>
            <Avatar alt={ auth.authed?.avatar?.value?.name || auth.account || 'Anonymous' } sx={ {
              width  : avatarWidth,
              height : avatarWidth,
            } } src={ auth.authed?.avatar?.image?.url ? `https://media.dashup.com/?width=${avatarWidth}&height=${avatarWidth}&src=${auth.authed.avatar.image.url}` : null } />
          </Tooltip>
        </Box>
        { /* / POST USER */ }

        <Paper sx={ {
          flex   : 1,

          '& .MuiTab-root' : {
            minHeight : theme.spacing(6),
          }
        } }>
          { open && props.size !== 'small' ? (
            <>
              <Box px={ 2 }>
                <Stack>
                  <PostInput
                    reset={ reset }

                    onBlur={ () => setFocus(false) }
                    onFocus={ () => setFocus(true) }
                    onChange={ (v) => setValue(v) }
                    onShiftEnter={ onPost }
                  />
                  { !!props.context && (
                    <Box mb={ 1 }>
                      <Chip icon={ <Tag /> } size="small" label={ props.context.name } />
                    </Box>
                  ) }
                </Stack>
              </Box>
              <AppBar position="static">
                <Tabs
                  value={ types.indexOf(type) }
                  onChange={ (e, value) => setType(types[value]) }
                  variant="scrollable"
                  textColor="inherit"
                  indicatorColor="primary"
                  scrollButtons
                  disableGutters
                  allowScrollButtonsMobile
                >
                  <Tab
                    id="text"
                    icon={ <ShortText fontSize="small" /> }
                    label="Text"
                    iconPosition="start"
                  />
                  <Tab
                    id="image"
                    icon={ <Image fontSize="small" /> }
                    label="Image"
                    iconPosition="start"
                  />
                  <Tab
                    id="video"
                    icon={ <VideoLibrary fontSize="small" /> }
                    label="Video"
                    iconPosition="start"
                  />

                  <LoadingButton
                    sx={ {
                      my : 1,
                      ml : 'auto',
                    } }
                    size="small"
                    onClick={ onPost }
                    variant="contained"
                    loading={ !!posting }
                    disabled={ !(value || '').trim().length }
                  >
                    { focus ? 'Shift + Enter' : 'Post' }
                  </LoadingButton>
                </Tabs>
              </AppBar>
            </>
          ) : (
            <Box py={ 1 } px={ 2 } sx={ {
              border       : `1px solid transparent`,
              borderRadius : `${theme.shape.borderRadius}px`,

              '&:hover' : {
                border : `1px solid ${theme.palette.primary.main}`,
              },
            } }>
              <Stack spacing={ 1 } direction="row" alignItems="center">
                <Box
                  p={ open ? 0 : 1 }
                  sx={ {
                    flex       : 1,
                    cursor     : 'pointer',
                    display    : 'flex',
                    alignItems : 'center',

                    '& p' : {
                      marginBlockEnd   : 0,
                      marginBlockStart : 0,
                    }
                  } }
                  onClick={ () => open ? undefined : setOpen(true) }
                >
                  { open ? (
                    <PostInput
                      reset={ reset }

                      onBlur={ () => setFocus(false) }
                      onFocus={ () => setFocus(true) }
                      onEnter={ onPost }
                      onChange={ (v) => setValue(v) }
                      onKeyDown={ props.onKeyDown }
                    />
                  ) : (
                    <Typography>
                      Say Something...
                    </Typography>
                  ) }
                </Box>
                <Box display="flex" flexDirection="row">
                  <IconButton
                    size={ props.size }
                    color={ type === 'image' ? 'primary' : 'inherit' }
                    onClick={ () => !setOpen(true) && setType('image') }
                  >
                    <Image />
                  </IconButton>
                  <IconButton
                    size={ props.size }
                    color={ type === 'video' ? 'primary' : 'inherit' }
                    onClick={ () => !setOpen(true) && setType('video') }
                  >
                    <VideoLibrary />
                  </IconButton>
                </Box>
              </Stack>
            </Box>
          ) }
        </Paper>
      </Stack>
    </Box>
  );
};

// export default
export default NFTPostCreate;