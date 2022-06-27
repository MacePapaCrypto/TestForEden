
// import props
import Image from '@mui/icons-material/Image';
import useAuth from '../useAuth';
import NFTAvatar from '../NFT/Avatar';
import ShortText from '@mui/icons-material/ShortText';
import PostInput from './Input';
import VideoLibrary from '@mui/icons-material/VideoLibrary';
import LoadingButton from '@mui/lab/LoadingButton';
import React, { useState } from 'react';
import { Box, Chip, Stack, Avatar, AppBar, Tabs, Tab, useTheme, IconButton, Typography } from '@mui/material';

// import reply
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHashtag, faMoon, faFeed, faGalleryThumbnails, faComment } from '@fortawesome/pro-regular-svg-icons';

/**
 * create content
 *
 * @param props 
 */
const MoonPostCreate = (props = {}) => {
  // post type
  const auth = useAuth();
  const theme = useTheme();
  const types = ['text', 'image', 'video'];
  
  // open post
  const [open, setOpen] = useState(!!props.isOpen);
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

  // icon
  const subSpaceIcon = {
    chat    : faHashtag,
    feed    : faFeed,
    gallery : faGalleryThumbnails,
  };

  // return jsx
  return (
    <Box sx={ {
      flex : 0,
    } }>
      <Stack spacing={ 2 } direction="row">
        { /* POST USER `*/ }
        { !props.noAvatar && (
          <Box>
            <NFTAvatar width={ avatarWidth } height={ avatarWidth } user={ auth.authed } sx={ {
              color : `rgba(255, 255, 255, 0.25)`,
            } } />
          </Box>
        ) }
        { /* / POST USER */ }

        <Box sx={ {
          flex         : 1,
          border       : `${theme.shape.borderWidth} solid ${theme.palette.border.primary}`,
          borderRadius : `${theme.shape.borderRadius}px`,
          
          '&:hover' : {
            borderColor : theme.palette.border.active,
          },

          '& .MuiTab-root' : {
            minHeight : theme.spacing(6),
          }
        } }>
          { open && props.size !== 'small' ? (
            <>
              <Box px={ 2 }>
                <Stack>
                  { !!props.replyTo && (
                    <Box mt={ 1 }>
                      <Chip icon={ (
                        <FontAwesomeIcon icon={ faComment } />
                      ) } size="small" label={ (
                        <Stack spacing={ 0.5 } direction="row">
                          <Box component="span" color={ theme.palette.primary.main }>
                            Responding to:
                          </Box>
                          <Box component="span" color="#fff">
                            { props.replyTo.content }
                          </Box>
                        </Stack>
                      ) } />
                    </Box>
                  ) }
                  <Box py={ 2 }>
                    <PostInput
                      reset={ reset }

                      onBlur={ () => setFocus(false) }
                      onFocus={ () => setFocus(true) }
                      onEnter={ onPost }
                      onChange={ (v) => setValue(v) }
                    />
                  </Box>
                  { !!(props.space || props.subSpace) && (
                    <Stack spacing={ 1 } direction="row" mb={ 1 }>
                      { !!props.space && (
                        <Chip
                          icon={ props.space?.image?.image?.url ? undefined : <FontAwesomeIcon icon={ faMoon } size="xs" /> }
                          size="small"
                          label={ props.space.name }
                          avatar={ props.space?.image?.image?.url ? <Avatar alt={ props.space.image.value.name } src={ `${props.space.image.image.url}?w=${24}&h=${24}` } /> : undefined }
                        />
                      ) }
                      { !!props.subSpace && (
                        <Chip
                          icon={ props.subSpace?.image?.image?.url ? undefined : <FontAwesomeIcon icon={ subSpaceIcon[props.subSpace.feed] } size="xs" /> }
                          size="small"
                          label={ props.subSpace.name }
                          avatar={ props.subSpace?.image?.image?.url ? <Avatar alt={ props.subSpace.image.value.name } src={ `${props.subSpace.image.image.url}?w=${24}&h=${24}` } /> : undefined }
                        />
                      ) }
                    </Stack>
                  ) }
                </Stack>
              </Box>
              <AppBar position="static" sx={ {
                px : 2
              } }>
                <Tabs
                  value={ types.indexOf(type) }
                  onChange={ (e, value) => setType(types[value]) }
                  variant="scrollable"
                  indicatorColor="primary"
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
                    disabled={ !!(!(value || '').trim().length) }
                  >
                    { focus ? 'Enter' : 'Post' }
                  </LoadingButton>
                </Tabs>
              </AppBar>
            </>
          ) : (
            <Box py={ 1 } px={ 2 } sx={ {
              borderRadius : 1,
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
                    onClick={ () => [setOpen(true), setType('image')] }
                  >
                    <Image />
                  </IconButton>
                  <IconButton
                    size={ props.size }
                    color={ type === 'video' ? 'primary' : 'inherit' }
                    onClick={ () => [setOpen(true), setType('video')] }
                  >
                    <VideoLibrary />
                  </IconButton>
                </Box>
              </Stack>
            </Box>
          ) }
        </Box>
      </Stack>
    </Box>
  );
};

// export default
export default MoonPostCreate;