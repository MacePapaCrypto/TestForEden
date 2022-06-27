
import React, { useRef, useState } from 'react';
import { CircularProgress, DialogContent, DialogContentText, Typography } from '@mui/material';
import { TextField, Stack, Box, Avatar, ListItem, ListItemText, ListItemAvatar, useTheme } from '@mui/material';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faPlus, faLock, faAngleRight, faHexagonImage } from '@fortawesome/pro-regular-svg-icons';

// local
import { useAuth, NFTPicker, useSocket, useDesktop, Button } from '@moonup/ui';

// space modal
const SpaceAppCreate = (props = {}) => {
  // use state
  const [item, setActualItem] = useState(props.item || {});
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
    const createdSpace = await socket.post('/space', item);

    // create task
    const createdTask = await desktop.createTask({
      type : 'space',
      path : createdSpace.id,
    });

    // set creating
    setCreating(false);

    // set space
    await props.onClose();
    await props.bringToFront(createdTask.id);
  };
  
  // return jsx
  return (
    <Box display="flex" flex={ 1 } flexDirection="column">

      { !!creating && (
        <Box p={ 3 } display="flex" flexDirection="row" justifyContent="center">
          <CircularProgress />
        </Box>
      ) }

      { !item.privacy && (
        <>
          <DialogContent>
            <DialogContentText sx={ {
              textAlign : 'center',
            } }>
              How do you want people to find your Space?
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
                <ListItemText primary="Public Space" secondary="Anyone can join this Space" />
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
                <ListItemText primary="Private Space" secondary="Invited people can join this Space" />
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
                <ListItemText primary="Locked Space" secondary="People who own your NFT can join this Space" />
                <Box ml={ 2 }>
                  <FontAwesomeIcon icon={ faAngleRight } size="xl" />
                </Box>
              </ListItem>
            </Stack>
          </DialogContent>
        </>
      ) }

      { !!(item.privacy === 'nft' && !selected) && (
        <>
          <DialogContent>
            <DialogContentText sx={ {
              textAlign : 'center',
            } }>
              Which NFT(s) Unlocks your Space
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
    
            <Button fullWidth variant="contained" onClick={ () => !setImageMenu(false) && setSelected((item.nfts || [])[0]?.id) } loading={ false } disabled={ !(item.nfts || [])[0]?.id }>
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
      { !!((['public', 'private'].includes(item.privacy) || (item.privacy === 'nft' && selected)) && !creating) && (
        <>
          <DialogContent>
            <DialogContentText sx={ {
              textAlign : 'center',
            } }>
              Tell us about your Space
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
    
            <TextField fullWidth label="Space Name" variant="filled" margin="dense" value={ item.name || '' } onChange={ (e) => setItem('name', e.target.value) } />
            <TextField fullWidth label="Space Description" variant="filled" margin="dense" multiline value={ item.description || '' } onChange={ (e) => setItem('description', e.target.value) } />
    
            <Box mt={ 2 } />
    
            <Button fullWidth variant="contained" onClick={ () => onCreate() } loading={ !!creating } disabled={ !(item.name || '').length }>
              Create Space
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
  );
};

// export default
export default SpaceAppCreate;