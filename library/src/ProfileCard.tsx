
// import react
import Link from './Link';
import useAuth from './useAuth';
import useSocket from './useSocket';
import NFTPicker from './NFTPicker';
import React, { useRef, useState } from 'react';
import { Box, Avatar, Paper, Stack, useTheme, Tooltip } from '@mui/material';

/**
 * profile page sidebar
 *
 * @param props 
 */
const NFTProfileCard = (props = {}) => {
  // use theme
  const auth = useAuth();
  const theme = useTheme();
  const socket = useSocket();
  const avatarRef = useRef(null);
  const [picker, setPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // get item
  const item = props.item || props.account;
  const isMine = `${item.id || item.account}`.toLowerCase() === `${auth.account}`.toLowerCase();
  const avatarWidth = theme.spacing(10).replace('px', '');

  // on avatar
  const onAvatar = () => {
    // check account
    if (!isMine) return;

    // pop up avatar modal
    setPicker(true);
  };

  // on select
  const onSelect = async (nft) => {
    // check nft
    if (!nft) return;
    
    // loading
    setPicker(false);
    setLoading(true);

    // set nft
    const account = await socket.post(`/account/update`, {
      avatar : nft.id,
    });

    // auth
    auth.emitUser(account);

    // loading
    setLoading(false);
  };

  // return jsx
  return (
    <>
      <Paper elevation={ 0 }>
        <Box p={ 2 }>

          <Stack spacing={ 1 }>

            <Box display="flex" justifyContent="center">
              <Tooltip title={ isMine ? 'Change Avatar' : item.id || item.account }>
                <Avatar alt={ item.id || item.account } ref={ avatarRef } sx={ {
                  width  : `${avatarWidth}px`,
                  height : `${avatarWidth}px`,
                  cursor : 'pointer',
                } } onClick={ onAvatar } src={ item.avatar?.image?.url ? `https://media.dashup.com/?width=${avatarWidth}&height=${avatarWidth}&src=${item.avatar.image.url}` : null } />
              </Tooltip>
            </Box>

            <Box />

            <Box component={ Link } to={ `/a/${item.id || item.account}` } sx={ {
              ...theme.typography.body1,

              color        : theme.palette.text.primary,
              overflow     : 'hidden',
              textAlign    : 'center',
              whiteSpace   : 'nowrap',
              fontWeight   : theme.typography.fontWeightBold,
              textOverflow : 'ellipsis',
            } }>
              { item.id || item.account }
            </Box>

            <Box component={ Link } to={ `/a/${item.id || item.account}` } sx={ {
              ...theme.typography.body2,

              color        : `rgba(255, 255, 255, 0.4)`,
              overflow     : 'hidden',
              textAlign    : 'center',
              whiteSpace   : 'nowrap',
              textOverflow : 'ellipsis',
            } }>
              { item.id || item.account }
            </Box>

          </Stack>

        </Box>
      </Paper>

      <NFTPicker
        open={ !!picker }
        title="Select New Avatar"
        onPick={ (nft) => onSelect(nft) }
        onClose={ () => setPicker(false) }
        anchorEl={ avatarRef.current }
        anchorOrigin={ {
          vertical   : 'bottom',
          horizontal : 'left',
        } }
      />
    </>
  );
};

// export default
export default NFTProfileCard;