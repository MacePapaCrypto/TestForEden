
import dotProp from 'dot-prop';
import React, { useEffect, useState } from 'react';
import { Box, Stack, Tooltip, Typography, CircularProgress, useTheme } from '@mui/material';

// socket
import { useSocket, useFollow, useDesktop, useParams, useInstall, ScrollBar, Button } from '@moonup/ui';

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
  const theme = useTheme();
  const socket = useSocket();
  const desktop = useDesktop();

  // follow
  const follow = useFollow(item, 'theme');
  const install = useInstall(item);

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
    return dotProp.get(item || {}, `theme.${el}`) || dotProp.get(theme, el);
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
                    borderRadius : 2,

                    backgroundSize     : 'cover',
                    backgroundColor    : getTheme('palette.background.default'),
                    backgroundImage    : getTheme('theme.shape.background') && `url(https://img.moon.social/?height=${props.size === 'small' ? 140 : 180}&src=${getTheme('theme.shape.background')})`,
                    backgroundPosition : 'center',
                  } }
                />
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
                    { !item.default && (
                      <Button onClick={ () => install.install ? install.remove() : install.create() } loading={ install.loading }>
                        { `${install.installs} installs` }
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
            { item.default ? (
              <Button variant="contained" onClick={ () => desktop.findOrCreateTask({ theme : item.id, path : '/' }) } loading={ desktop.loading === 'create' }>
                Open Theme
              </Button>
            ) : (
              <Button variant={ install.install ? 'contained' : undefined } onClick={ () => install.install ? install.remove() : install.create() } loading={ install.loading }>
                { install.install ? 'Installed' : 'Install' }
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