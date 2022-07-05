
import React, { useState } from 'react';
import { Box, Stack, CircularProgress, useTheme } from '@mui/material';

// socket
import { useThemes, ScrollBar, Button } from '@moonup/ui';

// font awesome icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHexagonCheck } from '@fortawesome/pro-regular-svg-icons';

// local
import Item from './Item';

/**
 * theme store theme
 *
 * @param props 
 * @returns 
 */
const ThemeStoreInstalled = (props = {}) => {
  // socket
  const theme = useTheme();
  const themes = useThemes();

  // return jsx
  return (
    <Box display="flex" flex={ 1 } flexDirection="column">
      { !!themes.loading ? (
        <Box flex={ 1 } display="flex" flexDirection="column" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      ) : (
        <ScrollBar isFlex>
          <Box display="flex" flex={ 1 } padding={ 2 } flexWrap="wrap">
            { themes.themes.map((item, index) => {
              // return theme
              return (
                <Box mb={ 2 } key={ item.id }>
                  <Item index={ index } item={ item } size="large" onSelect={ props.onSelect } />
                </Box>
              );
            }) }
          </Box>
        </ScrollBar>
      ) }
      { !themes.loading && (
        <Box sx={ {
          flex          : 0,
          display       : 'flex',
          padding       : 2,
          borderTop     : `${theme.shape.borderWidth} solid ${theme.palette.divider}`,
          flexDirection : 'row',
        } }>
          <Stack direction="row" spacing={ 1 } ml="auto">
            <Button variant="contained" onClick={ () => props.pushPath(`/create`) }>
              Create Theme
            </Button>
          </Stack>
        </Box>
      ) }
    </Box>
  );
};

// export default
export default ThemeStoreInstalled;