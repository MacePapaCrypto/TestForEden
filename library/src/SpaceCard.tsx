
// import react
import Link from './Link';
import React from 'react';
import useFollow from './useFollow';
import useMember from './useMember';
import humanNumber from 'human-number';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Avatar, Paper, Stack, Button, useTheme, Tooltip, Typography } from '@mui/material';

/**
 * profile page sidebar
 *
 * @param props 
 */
const NFTSpaceCard = (props = {}) => {
  // use theme
  const theme = useTheme();
  const follow = useFollow(props.item || props.space, 'space');
  const member = useMember(props.item || props.space);

  // get item
  const item = props.item || props.space;
  const avatarWidth = theme.spacing(10).replace('px', '');

  // return jsx
  return (
    <>
      <Paper elevation={ 0 }>
        <Box px={ 2 } py={ 3 } sx={ {
          borderBottom : `${theme.spacing(.5)} solid ${theme.palette.background.default}`,
        } }>

          <Stack spacing={ 1 }>

            <Box display="flex" justifyContent="center">
              <Tooltip title={ item.name || item.id }>
                <Avatar alt={ item.name || item.id } sx={ {
                  width  : `${avatarWidth}px`,
                  height : `${avatarWidth}px`,
                  cursor : 'pointer',
                } } src={ item.image?.image?.url ? `${item.image.image.url}?w=${avatarWidth}&h=${avatarWidth}` : null } />
              </Tooltip>
            </Box>

            <Box />

            <Box component={ Link } to={ `/s/${item.id}` } sx={ {
              ...theme.typography.body1,

              color        : theme.palette.text.primary,
              overflow     : 'hidden',
              textAlign    : 'center',
              whiteSpace   : 'nowrap',
              fontWeight   : theme.typography.fontWeightBold,
              textOverflow : 'ellipsis',
            } }>
              { item.name }
            </Box>

            <Box component={ Link } to={ `/s/${item.id}` } sx={ {
              ...theme.typography.body2,

              color        : `rgba(255, 255, 255, 0.4)`,
              overflow     : 'hidden',
              textAlign    : 'center',
              whiteSpace   : 'nowrap',
              textOverflow : 'ellipsis',
            } }>
              { item.description }
            </Box>

          </Stack>

        </Box>
        <Box sx={ {
          display        : 'flex',
          textAlign      : 'center',
          alignItems     : 'center',
          borderBottom   : `${theme.spacing(.5)} solid ${theme.palette.background.default}`,
          flexDirection  : 'row',
          justifyContent : 'center',
        } }>
          <Box flex={ 1 } py={ 3 } px={ 2 } borderRight={ `${theme.spacing(.25)} solid ${theme.palette.background.default}` } maxWidth="50%">
            <Typography variant="h5">
              { humanNumber(follow.followers) }
            </Typography>
            <Typography variant="body2">
              Followers
            </Typography>
          </Box>
          <Box flex={ 1 } py={ 3 } px={ 2 } borderLeft={ `${theme.spacing(.25)} solid ${theme.palette.background.default}` } maxWidth="50%">
            <Typography variant="h5">
              { humanNumber(member.members) }
            </Typography>
            <Typography variant="body2">
              Members
            </Typography>
          </Box>
        </Box>
        <Box sx={ {
          display        : 'flex',
          textAlign      : 'center',
          alignItems     : 'center',
          flexDirection  : 'row',
          justifyContent : 'center',
        } }>
          <Box flex={ 1 } py={ 3 } px={ 2 } borderRight={ `${theme.spacing(.25)} solid ${theme.palette.background.default}` } maxWidth="50%">
            <LoadingButton fullWidth variant={ follow.follow ? 'outlined' : 'contained' } loading={ !!follow.loading } onClick={ () => follow.follow ? follow.remove() : follow.create() }>
              { follow.follow ? 'Unfollow' : 'Follow' }
            </LoadingButton>
          </Box>
          <Box flex={ 1 } py={ 3 } px={ 2 } borderLeft={ `${theme.spacing(.25)} solid ${theme.palette.background.default}` } maxWidth="50%">
            <LoadingButton fullWidth variant={ member.member ? 'outlined' : 'contained' } loading={ !!member.loading } onClick={ () => member.member ? member.remove() : member.create() }>
              { member.member ? 'Leave' : 'Join' }
            </LoadingButton>
          </Box>
        </Box>
      </Paper>
    </>
  );
};

// export default
export default NFTSpaceCard;