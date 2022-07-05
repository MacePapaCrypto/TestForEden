
import React, { useRef, useState } from 'react';
import { CircularProgress, DialogContent, DialogContentText, Typography } from '@mui/material';
import { TextField, Stack, Box, Avatar, ListItem, ListItemText, ListItemAvatar, useTheme } from '@mui/material';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faPlus, faLock, faAngleRight, faHexagonImage, faHashtag, faFeed, faGalleryThumbnails } from '@fortawesome/pro-regular-svg-icons';

// local
import { Button, useAuth, useSocket, NFTPicker, useDesktop } from '@moonup/ui';

// space modal
const AppSpaceCreateSub = (props = {}) => {
  // use state
  const [item] = useState({});
  const [updated, setUpdated] = useState(new Date());
  const [selected, setSelected] = useState(false);
  const [creating, setCreating] = useState(false);
  const [imageMenu, setImageMenu] = useState(false);

  // ref
  const imageMenuRef = useRef(null);

  // theme
  const auth = useAuth();
  const theme = useTheme();
  const socket = useSocket();
  const desktop = useDesktop();

  // on public
  const setItem = (key, value) => {
    // set to item
    item[key] = value;
    
    // update
    setUpdated(new Date());
  };

  // on nft
  const onNFT = (nft) => {
    // set nft
    setItem('nfts', [...(item.nfts || []), nft].reduce((accum, nft) => {
      // check found
      if (!accum.find((n) => n.id === nft.id)) accum.push(nft);

      // return
      return accum;
    }, []));

    // set image by default
    if (!item.name) setItem('name', nft.name);
    if (!item.image) setItem('image', nft);

    // close menu
    setImageMenu(false);
  };

  // on create
  const onCreate = async () => {
    // on create
    setCreating(true);

    // load
    const createdSpace = await socket.post('/space', {
      ...item,

      space : props.space?.id,
    });

    // find actual space
    let actualSpace = (desktop.tasks || []).find((t) => t.type === 'space' && t.path === props.space?.id);

    // check exists
    if (!actualSpace) {
      // create task
      actualSpace = await desktop.createTask({
        type : 'space',
        path : `${props.space?.id}/${createdSpace?.id}`,
      });
    } else {
      await desktop.updateTask({
        id   : actualSpace.id,
        path : `${props.space?.id}/${createdSpace?.id}`,
      });
    }

    // set space
    await props.onClose();
    await props.bringToFront(actualSpace.id);
  };

  // steps
  let step = 'details';
  if (creating) {
    step = 'loading';
  } else if (!item.feed) {
    step = 'feed';
  } else if (!item.privacy) {
    step = 'privacy';
  } else if (item.privacy === 'nft' && !item.nft) {
    step = 'nft';
  }
  
  // return jsx
  return (
    <Box display="flex" flex={ 1 } flexDirection="column">

      { step === 'loading' && (
        <Box p={ 3 } display="flex" flexDirection="row" justifyContent="center">
          <CircularProgress />
        </Box>
      ) }

      { step === 'feed' && (
        <>
          <DialogContent>
            <DialogContentText sx={ {
              textAlign : 'center',
            } }>
              What type of SubSpace do you want to create?
            </DialogContentText>
          </DialogContent>
          <DialogContent sx={ {
            background : `rgba(0, 0, 0, 0.5)`,
          } }>
            <Stack sx={ {
              width : '100%',

              '& .MuiListItem-root' : {
                cursor       : 'pointer',
                borderRadius : `${theme.shape.borderRadius}px`,
              },
              '& .MuiListItem-root:hover' : {
                bgcolor : `rgba(255, 255, 255, 0.1)`,
              }
            } } spacing={ 2 }>
              <ListItem onClick={ () => setItem('feed', 'chat') }>
                <ListItemAvatar>
                  <Avatar>
                    <FontAwesomeIcon icon={ faHashtag } />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Text SubSpace" secondary="Chat space for messages, images, etc" />
                <Box ml={ 2 }>
                  <FontAwesomeIcon icon={ faAngleRight } size="xl" />
                </Box>
              </ListItem>
              <ListItem onClick={ () => setItem('feed', 'feed') }>
                <ListItemAvatar>
                  <Avatar>
                    <FontAwesomeIcon icon={ faFeed }  />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Feed SubSpace" secondary="Feed space for posts, discussions, questions, shop items" />
                <Box ml={ 2 }>
                  <FontAwesomeIcon icon={ faAngleRight } size="xl" />
                </Box>
              </ListItem>
              <ListItem onClick={ () => setItem('feed', 'gallery') }>
                <ListItemAvatar>
                  <Avatar>
                    <FontAwesomeIcon icon={ faGalleryThumbnails }  />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Gallery SubSpace" secondary="Gallery space for images, nfts, shop items" />
                <Box ml={ 2 }>
                  <FontAwesomeIcon icon={ faAngleRight } size="xl" />
                </Box>
              </ListItem>
            </Stack>
          </DialogContent>
        </>
      ) }

      { step === 'privacy' && (
        <>
          <DialogContent>
            <DialogContentText sx={ {
              textAlign : 'center',
            } }>
              How private is this SubSpace?
            </DialogContentText>
          </DialogContent>
          <DialogContent sx={ {
            background : `rgba(0, 0, 0, 0.5)`,
          } }>
            <Stack sx={ {
              width : '100%',

              '& .MuiListItem-root' : {
                cursor       : 'pointer',
                borderRadius : `${theme.shape.borderRadius}px`,
              },
              '& .MuiListItem-root:hover' : {
                bgcolor : `rgba(255, 255, 255, 0.1)`,
              }
            } } spacing={ 2 }>
              <ListItem onClick={ () => setItem('privacy', 'public') }>
                <ListItemAvatar>
                  <Avatar>
                    <FontAwesomeIcon icon={ faBullhorn } />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Public SubSpace" secondary="Anyone can use this Space" />
                <Box ml={ 2 }>
                  <FontAwesomeIcon icon={ faAngleRight } size="xl" />
                </Box>
              </ListItem>
              <ListItem onClick={ () => setItem('privacy', 'private') }>
                <ListItemAvatar>
                  <Avatar>
                    <FontAwesomeIcon icon={ faLock }  />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Private SubSpace" secondary="Only specific roles can use this Space" />
                <Box ml={ 2 }>
                  <FontAwesomeIcon icon={ faAngleRight } size="xl" />
                </Box>
              </ListItem>
              <ListItem onClick={ () => setItem('privacy', 'nft') }>
                <ListItemAvatar>
                  <Avatar>
                    <FontAwesomeIcon icon={ faHexagonImage }  />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary="Locked SubSpace" secondary="People who own your NFT can use this Space" />
                <Box ml={ 2 }>
                  <FontAwesomeIcon icon={ faAngleRight } size="xl" />
                </Box>
              </ListItem>

              <Button fullWidth variant="contained" onClick={ () => setItem('privacy', 'public') } loading={ false }>
                Skip
              </Button>
            </Stack>
          </DialogContent>
        </>
      ) }

      { step === 'nft' && (
        <>
          <DialogContent>
            <DialogContentText sx={ {
              textAlign : 'center',
            } }>
              Which NFT(s) Unlocks your SubSpace
            </DialogContentText>
          </DialogContent>
          <DialogContent sx={ {
            background : `rgba(0, 0, 0, 0.5)`,
          } }>
            <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center" mt={ 2 }>
              { (item.nfts || []).map((nft) => {
                // return jsx
                return (
                  <Avatar
                    sx={ {
                      mx     : 1,
                      mb     : 2,
                      width  : 80,
                      height : 80,
                    } }
                    key={ nft.id }
                    src={ nft.image?.url ? `${nft.image.url}?w=80&h=80` : null }
                  />
                );
              }) }
              <Avatar
                sx={ {
                  mb     : 2,
                  mx     : 1,
                  width  : 80,
                  height : 80,
                } }
                ref={ imageMenuRef }
                onClick={ () => setImageMenu(true) }
              >
                <FontAwesomeIcon icon={ faPlus } />
              </Avatar>
            </Box>
            <Box textAlign="center" mb={ 3 }>
              <Typography>
                { item.nft?.name || 'No NFT Selected' }
              </Typography>
            </Box>

            <Button fullWidth variant="contained" onClick={ () => !setImageMenu(false) && setSelected((item.nfts || [])[0]?.id) } disabled={ !(item.nfts || [])[0]?.id } loading={ false }>
              Next
            </Button>
          </DialogContent>

          <NFTPicker
            open={ !!(imageMenuRef.current && imageMenu) }
            title="Select Space Image"
            onPick={ onNFT }
            onClose={ () => setImageMenu(false) }
            account={ auth.account }
            anchorEl={ imageMenuRef.current }
            placement="right-start"
          />
        </>
      ) }

      { step === 'details' && (
        <>
          <DialogContent>
            <DialogContentText sx={ {
              textAlign : 'center',
            } }>
              Tell us about your SubSpace
            </DialogContentText>
          </DialogContent>
          <DialogContent sx={ {
            background : `rgba(0, 0, 0, 0.5)`,
          } }>
            <Box display="flex" flexDirection="row" justifyContent="center" my={ 2 }>
              <Avatar
                sx={ {
                  width  : 80,
                  height : 80,
                } }
                ref={ imageMenuRef }
                src={ item.image?.image?.url ? `${item.image.image.url}?w=80&h=80` : null }
                onClick={ () => setImageMenu(true) }
              />
            </Box>
            { !!(item.image?.name) && (
              <Box textAlign="center" mb={ 3 }>
                <Typography>
                  { item.image?.name }
                </Typography>
              </Box>
            ) }

            <TextField fullWidth label="SubSpace Name" variant="filled" margin="dense" value={ item.name || '' } onChange={ (e) => setItem('name', e.target.value) } />
            <TextField fullWidth label="SubSpace Description" variant="filled" margin="dense" multiline value={ item.description || '' } onChange={ (e) => setItem('description', e.target.value) } />

            <Box mt={ 2 } />

            <Button fullWidth variant="contained" onClick={ () => onCreate() } loading={ !!creating } disabled={ !(item.name || '').length }>
              Create SubSpace
            </Button>
          </DialogContent>

          <NFTPicker
            open={ !!(imageMenuRef.current && imageMenu) }
            title="Select Space Image"
            onPick={ (nft) => !setImageMenu(false) && setItem('image', nft) }
            onClose={ () => setImageMenu(false) }
            account={ auth.account }
            anchorEl={ imageMenuRef.current }
            placement="right-end"
          />
        </>
      ) }
    </Box>
  )
};

// export default
export default AppSpaceCreateSub;