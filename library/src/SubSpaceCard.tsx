
// import react
import Link from './Link';
import React from 'react';
import { Box, Avatar, Paper, Stack, Button, useTheme, Tooltip, Typography } from '@mui/material';

/**
 * profile page sidebar
 *
 * @param props 
 */
const NFTSubSpaceCard = (props = {}) => {
  // use theme
  const theme = useTheme();

  // get item
  const item = props.item || props.subSpace;
  const avatarWidth = theme.spacing(10).replace('px', '');

  // return jsx
  return (
    <>
      <Paper elevation={ 0 }>
        <Box px={ 2 } py={ 3 }>

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
      </Paper>
    </>
  );
};

// export default
export default NFTSubSpaceCard;