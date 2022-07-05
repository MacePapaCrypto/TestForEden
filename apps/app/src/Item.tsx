
// import react
import React from 'react';
import { Box, Card, CardMedia, CardContent, Typography, useTheme, Tooltip } from '@mui/material';

// font awesome icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHexagonCheck } from '@fortawesome/pro-regular-svg-icons';

/**
 * app store item
 *
 * @param props 
 */
const AppStoreItem = (props = {}) => {
  // theme
  const theme = useTheme();

  // size
  const width = props.size === 'small' ? 240 : 345;

  // return jsx
  return (
    <Box paddingRight={ 2 } maxWidth={ `calc(${width}px + ${theme.spacing(2)})` }>
      <Card sx={ {
        border       : `${theme.shape.borderWidth} solid ${theme.palette.divider}`,
        cursor       : 'pointer',
        maxWidth     : width,
        minWidth     : width,
        transition   : 'all 0.2s ease',
        borderRadius : 2,

        '&:hover' : {
          border     : `${theme.shape.borderWidth} solid rgba(255, 255, 255, 0.25)`,
          background : 'rgba(255, 255, 255, 0.125)',
        }
      } } data-value={ props.index } onClick={ () => props.onSelect(props.item) }>
        <Box p={ 0.5 }>
          <CardMedia
            component="img"
            alt={ props.item.name }
            image={ `https://img.moon.social/?height=${props.size === 'small' ? 140 : 180}&src=${props.item.banner}` }
            height={ props.size === 'small' ? 140 : 180 }

            sx={ {
              borderRadius : 1,
            } }
          />
        </Box>
        <CardContent>
          <Box sx={ {
            mb         : props.size === 'small' ? undefined : 1,
            display    : 'flex',
            alignItems : 'center',
          } }>
            { !!props.item.verified && (
              <Tooltip title="Verified App">
                <Box component="span" mr={ 1 } color={ theme.palette.success.main }>
                  <FontAwesomeIcon icon={ faHexagonCheck } />
                </Box>
              </Tooltip>
            ) }
            <Typography variant="h6">
              { props.item.name }
            </Typography>
          </Box>
          { props.size !== 'small' && (
            <Typography variant="body2" color="text.secondary">
              { props.item.description }
            </Typography>
          ) }
        </CardContent>
        <Box />
      </Card>
    </Box>
  );
};

// export default
export default AppStoreItem;