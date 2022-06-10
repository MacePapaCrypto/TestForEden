
import React from 'react';
import { Box, Stack, Button, useTheme } from '@mui/material';

// font awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDownLeftAndArrowUpRightToCenter, faArrowUpRightAndArrowDownLeftFromCenter, faTimes } from '@fortawesome/pro-regular-svg-icons';

// create component
const MoonWindowBar = (props = {}) => {
  // theme
  const theme = useTheme();

  // widths
  const windowBarSize = parseInt(theme.spacing(6).replace('px', ''));
  const windowBarItemSize = parseInt(theme.spacing(4).replace('px', ''));

  // return jsx
  return (
    <Box sx={ {
      width   : '100%',
      height  : windowBarSize,
      display : 'flex',
    } }>
      <Stack direction="row" spacing={ 1 } sx={ {
        px           : theme.spacing(1),
        flex         : 1,
        alignItems   : 'center',
        borderBottom : `.1rem solid ${props.active ? theme.palette.primary.main : theme.palette.grey[300]}`,
      } }>
        <Button sx={ {
          width      : `${windowBarItemSize}px`,
          color      : theme.palette.grey[300],
          height     : `${windowBarItemSize}px`,
          minWidth   : `${windowBarItemSize}px`,
          background : 'transparent',
        } } variant="text">
          <FontAwesomeIcon icon={ faTimes } />
        </Button>

        <Box height={ theme.spacing(3) } borderRight={ `.1rem solid ${props.active ? theme.palette.primary.main : theme.palette.grey[300]}` } />

        <Stack direction="row" sx={ {
          px             : theme.spacing(1),
          flex           : 1,
          textAlign      : 'center',
          alignItems     : 'center',
          justifyContent : 'center',
        } }>
          { props.item.name }
        </Stack>

        <Box height={ theme.spacing(3) } borderRight={ `.1rem solid ${props.active ? theme.palette.primary.main : theme.palette.grey[300]}` } />

        <Button sx={ {
          width      : `${windowBarItemSize}px`,
          color      : theme.palette.grey[300],
          height     : `${windowBarItemSize}px`,
          minWidth   : `${windowBarItemSize}px`,
          background : 'transparent',
        } } variant="text">
          <FontAwesomeIcon icon={ faArrowUpRightAndArrowDownLeftFromCenter } />
        </Button>
      </Stack>
    </Box>
  );
};

// moon window bar
export default MoonWindowBar;