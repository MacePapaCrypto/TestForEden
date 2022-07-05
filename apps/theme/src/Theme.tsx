
import dotProp from 'dot-prop';
import React, { useEffect, useState } from 'react';
import { Box, Stack, Tooltip, Typography, CircularProgress, useTheme } from '@mui/material';

// socket
import { useAuth, useSocket, useFollow, useParams, useThemes, ScrollBar, Button } from '@moonup/ui';

// font awesome icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHexagonCheck } from '@fortawesome/pro-regular-svg-icons';

/**
 * theme store theme
 *
 * @param props 
 * @returns 
 */
const ThemeStoreTheme = (props = {}) => {
  // use params
  const { id } = useParams();

  // load item
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // socket
  const auth = useAuth();
  const theme = useTheme();
  const socket = useSocket();
  const themes = useThemes();

  // follow
  const follow = useFollow(item);

  // load theme
  const loadTheme = async () => {
    // loading
    setLoading(true);

    // load theme
    const loadedTheme = await socket.get(`/theme/${id}`);

    // set item
    setItem(loadedTheme);

    // loading
    setLoading(false);
  };

  // get theme thing
  const getTheme = (el) => {
    // get from theme
    return dotProp.get(item || {}, `theme.${el}`) || dotProp.get(themes.default, el) || dotProp.get(theme, el);
  };

  // use callback
  useEffect(() => {
    // load item
    loadTheme();
  }, [id]);

  // banner height
  const bannerHeight = 240;

  // return jsx
  return (
    <Box display="flex" flex={ 1 } flexDirection="column">
      <ScrollBar isFlex>
        <Box display="flex" flex={ 1 } flexDirection="column">
          { (loading || !item) ? (
            <Box flex={ 1 } display="flex" flexDirection="column" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box padding={ 1 }>
                <Box
                  sx={ {
                    width        : '100%',
                    height       : bannerHeight,
                    position     : 'relative',
                    borderRadius : 2,

                    backgroundSize     : 'cover',
                    backgroundColor    : getTheme('palette.background.default'),
                    backgroundImage    : getTheme('shape.backgroundImage') ? `url(https://img.moon.social/?height=${bannerHeight}&src=${getTheme('shape.backgroundImage')})` : null,
                    backgroundPosition : 'center',
                  } }
                >
                  <Box sx={ {
                    top           : '10%',
                    width         : bannerHeight,
                    right         : '5%',
                    bottom        : '10%',
                    display       : 'flex',
                    position      : 'absolute',
                    background    : getTheme('palette.background.paper'),
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
              <Box padding={ 2 }>
                <Box sx={ {
                  mb         : 1,
                  display    : 'flex',
                  alignItems : 'center',
                } }>
                  { !!item.verified && (
                    <Tooltip title="Verified Theme">
                      <Box component="span" mr={ 1 } color={ theme.palette.success.main }>
                        <FontAwesomeIcon icon={ faHexagonCheck } />
                      </Box>
                    </Tooltip>
                  ) }
                  <Typography variant="h6">
                    { item.name }
                  </Typography>
                  <Stack direction="row" spacing={ 1 } ml="auto">
                    <Button onClick={ () => follow.follow ? follow.remove() : follow.create() } loading={ follow.loading }>
                      { `${follow.followers} followers` }
                    </Button>
                    <Button variant={ themes.theme?.id === item.id ? 'contained' : undefined } onClick={ () => themes.choose(item) } loading={ themes.loading }>
                      { themes.theme?.id === item.id ? 'Chosen' : 'Choose Theme' }
                    </Button>
                    { (item.account === (auth?.account || '').toLowerCase()) && (
                      <Button onClick={ () => props.pushPath(`/theme/${item.id}/update`) }>
                        Update Theme
                      </Button>
                    ) }
                  </Stack>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  { item.description }
                </Typography>
              </Box>
            </>
          ) }
        </Box>
      </ScrollBar>
      { (!!item && !loading) && (
        <Box sx={ {
          flex          : 0,
          display       : 'flex',
          padding       : 2,
          borderTop     : `${theme.shape.borderWidth} solid ${theme.palette.divider}`,
          flexDirection : 'row',
        } }>
          <Stack direction="row" spacing={ 1 } ml="auto">
            <Button variant={ follow.follow ? 'contained' : undefined } onClick={ () => follow.follow ? follow.remove() : follow.create() } loading={ follow.loading }>
              { follow.follow ? 'Following' : 'Follow' }
            </Button>
            <Button variant={ themes.theme?.id === item.id ? 'contained' : undefined } onClick={ () => themes.choose(item) } loading={ themes.loading }>
              { themes.theme?.id === item.id ? 'Chosen' : 'Choose Theme' }
            </Button>
            { (item.account === (auth?.account || '').toLowerCase()) && (
              <Button onClick={ () => props.pushPath(`/theme/${item.id}/update`) }>
                Update Theme
              </Button>
            ) }
          </Stack>
        </Box>
      ) }
    </Box>
  );
};

// export default
export default ThemeStoreTheme;