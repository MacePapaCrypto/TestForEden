import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Stack, Paper, useTheme } from '@mui/material';
import React, { useState, useCallback } from 'react';

// locals
import NFTAvatar from '../../NFT/Avatar';

// use desktop
import useDesktop from '../../useDesktop';

// create item
const MoonAppSpaceItem = (props = {}) => {
  // theme
  const theme = useTheme();
  const desktop = useDesktop();

  // update
  const [opening, setOpening] = useState(false);

  // avatar width
  const avatarWidth = 40;

  // get links
  const getLinks = useCallback(() => {
    // links
    const links = [];

    // return array
    return [{
      name : 'Public',
    }];
  }, [props.item.id]);

  // on open
  const onOpen = useCallback(async () => {
    // opening
    setOpening(true);

    // find or create
    await desktop.findOrCreateTask({
      type : 'space',
      path : props.item.id,
    });

    // opening
    setOpening(false);
  }, [props.item.id]);

  // active
  const active = desktop.tasks.find((t) => t.type === 'space' && t.path.startsWith(props.item.id));

  // return jsx
  return (
    <Paper sx={ {
      p             : 1,
      width         : theme.spacing(30),
      cursor        : 'pointer',
      display       : 'flex',
      transition    : 'all 0.2s ease',
      borderRadius  : 1,
      flexDirection : 'column',

      background  : active ? 'rgba(255, 255, 255, 0.125)' : undefined,
      borderWidth : theme.shape.borderWidth,
      borderStyle : 'solid',
      borderColor : theme.palette.divider,

      '&:hover' : {
        border     : active ? `${theme.shape.borderWidth} solid ${theme.palette.border.primary}` : `${theme.shape.borderWidth} solid rgba(255, 255, 255, 0.25)`,
        background : 'rgba(255, 255, 255, 0.125)',
      },

      ...(props.sx || {}),
    } } onClick={ onOpen }>
      <Stack direction="column" spacing={ 1 }>
        <Stack direction="row" spacing={ 1 } sx={ {
          flex       : 0,
          position   : 'relative',
          minHeight  : avatarWidth,
          maxHeight  : avatarWidth,
          alignItems : 'center',
        } }>
          <NFTAvatar item={ props.item } sx={ {
            color : `rgba(255, 255, 255, 0.25)`,
            
            ...(props.feed === 'chat' ? {
              top      : 0,
              left     : 0,
              position : 'absolute',
            } : {})
          } } height={ avatarWidth } width={ avatarWidth } />

          <Stack spacing={ -.5 } direction="column" sx={ {
            flex           : 1,
            justifyContent : 'center',
          } }>
            <Box>
              <Box sx={ {
                ...(props.feed === 'chat' ? theme.typography.body2 : theme.typography.body1),

                width        : '100%',
                overflow     : 'hidden',
                fontWeight   : theme.typography.fontWeightMedium,
                whiteSpace   : 'nowrap',
                textOverflow : 'ellipsis',
              } }>
                { props.item.name || 'N/A' }
              </Box>
            </Box>
            <Box component="span" color="rgba(255, 255, 255, 0.4)" sx={ {
              ...theme.typography.body2,

              textDecoration : 'none',
            } }>
              { `${(props.item.count?.members || 1)} Members` }
            </Box>
          </Stack>
        </Stack>

        { /* SPACE TAGS */ }
        { props.feed !== 'chat' && !!getLinks().length && (
          <Stack spacing={ .5 } direction="row" sx={ {
            ...theme.typography.body2,
          } }>
            { getLinks().map((l, i) => {
              // return link
              return (
                <Box component="span" key={ `link-${props.item.id}-${i}` } sx={ {
                  color        : theme.palette.primary.main,
                  cursor       : 'pointer',
                  maxWidth     : theme.spacing(15),
                  overflow     : 'hidden',
                  whiteSpace   : 'nowrap',
                  textOverflow : 'ellipsis'
                } } onClick={ () => {} }>
                  { l.name }
                </Box>
              );
            }) }
          </Stack>
        ) }
        { /* SPACE TAGS */ }

        <Box sx={ {
          ...theme.typography.body2,

          textDecoration : 'none',
        } }>
          { props.item.description || 'N/A' }
        </Box>

        <LoadingButton loading={ opening } variant={ props.item?.member ? undefined : 'contained' }>
          { props.item?.member ? 'Joined Space' : 'View Space' }
        </LoadingButton>
      </Stack>
    </Paper>
  );
};

// export default
export default MoonAppSpaceItem;