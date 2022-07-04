
// import react
import React from 'react';
import dotProp from 'dot-prop';
import { Box, Card, CardMedia, CardContent, Typography, useTheme, Tooltip } from '@mui/material';

// font awesome icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHexagonCheck } from '@fortawesome/pro-regular-svg-icons';

/**
 * theme store item
 *
 * @param props 
 */
const ThemeStoreItem = (props = {}) => {
  // theme
  const theme = useTheme();

  // size
  const width = props.size === 'small' ? 240 : 345;

  // get theme thing
  const getTheme = (el) => {
    // get from theme
    return dotProp.get(props.item, `theme.${el}`) || dotProp.get(theme, el);
  };

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
          <Box sx={ {
            height       : props.size === 'small' ? 140 : 180,
            position     : 'relative',
            borderRadius : 1,

            backgroundSize     : 'cover',
            backgroundColor    : getTheme('palette.background.default'),
            backgroundImage    : getTheme('theme.shape.background') && `url(https://img.moon.social/?height=${props.size === 'small' ? 140 : 180}&src=${getTheme('theme.shape.background')})`,
            backgroundPosition : 'center',
          } }>
            <Box sx={ {
              top           : '10%',
              left          : '40%',
              right         : '5%',
              bottom        : '10%',
              display       : 'flex',
              position      : 'absolute',
              flexDirection : 'column',

              borderWidth  : `calc(${getTheme('shape.borderWidth')} / 2)`,
              borderStyle  : 'solid',
              borderColor  : getTheme('palette.border.active'),
              borderRadius : 1,
            } }>
              <Box sx={ {
                flex     : 0,
                color    : getTheme('palette.text.primary'),
                padding  : 1,
                fontSize : getTheme('typography.body2.fontSize'),

                borderBottomStyle : 'solid',
                borderBottomColor : getTheme('palette.border.primary'),
                borderBottomWidth : `calc(${getTheme('shape.borderWidth')} / 2)`,
              } }>
                App Name
              </Box>
              <Box sx={ {
                flex     : 1,
                color    : getTheme('palette.text.primary'),
                padding  : 1,
                fontSize : getTheme('typography.body2.fontSize'),
              } }>
                Moon App
              </Box>
            </Box>
          </Box>
        </Box>
        <CardContent>
          <Box sx={ {
            mb         : props.size === 'small' ? undefined : 1,
            display    : 'flex',
            alignItems : 'center',
          } }>
            { !!props.item.verified && (
              <Tooltip title="Verified Theme">
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
export default ThemeStoreItem;