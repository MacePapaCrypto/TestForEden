
// import react
import dotProp from 'dot-prop';
import { BlockPicker } from 'react-color';
import React, { useState, useEffect } from 'react';
import { Button, ScrollBar, useFollow, useParams, useSocket, useThemes } from '@moonup/ui';
import { Box, Stack, Grid, Divider, TextField, ButtonGroup, Popover, Typography, useTheme } from '@mui/material';

// font awesome icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/pro-regular-svg-icons';

/**
 * app theme create
 *
 * @param props 
 */
const ThemeStoreCreate = (props = {}) => {
  // use theme
  const theme = useTheme();
  const themes = useThemes();
  const socket = useSocket();

  // use params
  const { id } = useParams();

  // picker
  const [item, setItem] = useState({});
  const [color, setColor] = useState(null);
  const [other, setOther] = useState(null);
  const [primary, setPrimary] = useState(null);
  const [loading, setLoading] = useState(false);

  // follow
  const follow = useFollow(item);

  // color keys
  const primaryKeys = ['primary', 'secondary', 'success', 'error', 'info', 'warning'];

  // colors
  const primaryColors = primaryKeys.reduce((accum, color) => {
    // color
    accum[color] = dotProp.get(item, `theme.palette.${color}.main`) || theme.palette[color].main;

    // return accum
    return accum;
  }, {});

  // other keys
  const otherColors = [
    {
      key   : 'divider',
      name  : 'Divider',
      value : dotProp.get(item, 'theme.palette.divider') || theme.palette.divider,
    },
    {
      key   : 'border.primary',
      name  : 'Primary Border',
      value : dotProp.get(item, 'theme.palette.border.primary') || theme.palette.border.primary,
    },
    {
      key   : 'border.active',
      name  : 'Active Border',
      value : dotProp.get(item, 'theme.palette.border.active') || theme.palette.border.active,
    },
    {
      key   : 'background.paper',
      name  : 'Window Background',
      value : dotProp.get(item, 'theme.palette.background.paper') || theme.palette.background.paper,
    },
    {
      key   : 'background.default',
      name  : 'Desktop Background',
      value : dotProp.get(item, 'theme.palette.background.default') || theme.palette.background.default,
    },
    {
      key   : 'text.primary',
      name  : 'Text Color',
      value : dotProp.get(item, 'theme.palette.text.primary') || theme.palette.text.primary,
    },
  ];

  // on delete
  const onDelete = async () => {
    // delete
    themes.delete({
      id : item?.id,
    });

    // push
    props.pushPath('/installed');
  };

  // on update
  const updateName = (name) => {
    // update theme
    themes.update({
      id : item?.id,
      name,
    });
  };

  // on update
  const updateTheme = (theme) => {
    // update theme
    themes.update({
      id : item?.id,
      theme,
    });
  };

  // on update
  const updatePublished = (published) => {
    // update theme
    themes.update({
      id : item?.id,
      published,
    });
  };

  // on update
  const updateDescription = (description) => {
    // update theme
    themes.update({
      id : item?.id,
      description,
    });
  };

  // update color
  const updatePrimary = (c, hex) => {
    // set
    const newTheme = item?.theme || {};

    // set
    if (hex) {
      dotProp.set(newTheme, `palette.${c}.main`, hex);
    } else {
      dotProp.delete(newTheme, `palette.${c}`);
    }

    // update
    updateTheme(newTheme);
  };

  // update color
  const updateOther = ({ key }, hex) => {
    // set
    const newTheme = item?.theme || {};

    // set
    if (hex) {
      dotProp.set(newTheme, `palette.${key}`, hex);
    } else {
      dotProp.delete(newTheme, `palette.${key}`)
    }

    // update
    updateTheme(newTheme);
  };

  /**
   * update background image
   *
   * @param value 
   */
  const updateBackgroundImage = (value) => {
    // set
    const newTheme = item?.theme || {};

    // set
    if (value?.length) {
      dotProp.set(newTheme, 'shape.backgroundImage', value);
    } else {
      dotProp.delete(newTheme, 'shape.backgroundImage')
    }

    // update
    updateTheme(newTheme);
  };

  /**
   * update background image
   *
   * @param value 
   */
  const updateBackgroundVideo = (value) => {
    // set
    const newTheme = item?.theme || {};

    // set
    if (value?.length) {
      dotProp.set(newTheme, 'shape.backgroundVideo', value);
    } else {
      dotProp.delete(newTheme, 'shape.backgroundVideo')
    }

    // update
    updateTheme(newTheme);
  };

  // load theme
  const loadTheme = async () => {
    // loading
    setLoading(true);

    // check if create
    if (props.isCreate) {
      // load theme
      const createdTheme = await themes.create({});
  
      // set item
      setItem(createdTheme);
    } else {
      // load theme
      const loadedTheme = await themes.get(id);
  
      // set item
      setItem(loadedTheme);
    }

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

  // all colors
  const allColors = Array.from(new Set([...Object.values(primaryColors), ...(otherColors.map((c) => c.value))]));

  // banner height
  const bannerHeight = 240;

  // return jsx
  return (
    <Box display="flex" flex={ 1 } flexDirection="column">
      <ScrollBar isFlex>
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
            mb         : 2,
            display    : 'flex',
            alignItems : 'center',
          } }>
            <TextField label="Theme Name" value={ item?.name || '' } onChange={ (e) => updateName(e.target.value) } />
            <Stack direction="row" spacing={ 1 } ml="auto">
              <Button onClick={ () => follow.follow ? follow.remove() : follow.create() } loading={ follow.loading }>
                { `${follow.followers} followers` }
              </Button>
            </Stack>
          </Box>
          <Stack spacing={ 2 }>
            <TextField multiline fullWidth label="Theme Description" value={ item?.description || '' } onChange={ (e) => updateDescription(e.target.value) } />
            <Box>
              <Divider />
            </Box>
            <Box>
              <Typography variant="body1" sx={ {
                mb : 1,
              } }>
                Theme Colors
              </Typography>
              <Grid spacing={ 1 } container>
                { Object.keys(primaryColors).map((key) => {
                  // return jsx
                  return (
                    <Grid key={ `color-${key}` } item>
                      <ButtonGroup variant="contained">
                        <Button sx={ {
                          color       : theme.palette.getContrastText(primaryColors[key]),
                          background  : primaryColors[key],
                          borderColor : `${primaryColors[key]}!important`,

                          '&:hover' : {
                            color      : theme.palette.getContrastText(primaryColors[key]),
                            background : primaryColors[key],
                          }
                        } } onClick={ (e) => [setColor(key), setPrimary(e.target)] }>
                          { key }
                        </Button>
                        <Button sx={ {
                          color       : theme.palette.getContrastText(primaryColors[key]),
                          background  : primaryColors[key],
                          borderColor : `${primaryColors[key]}!important`,

                          '&:hover' : {
                            color      : theme.palette.getContrastText(primaryColors[key]),
                            background : primaryColors[key],
                          }
                        } } onClick={ (e) => updatePrimary(key, null) }>
                          <FontAwesomeIcon icon={ faTimes } fixedWidth />
                        </Button>
                      </ButtonGroup>
                    </Grid>
                  );
                }) }
              </Grid>
            </Box>
            <Box>
              <Typography variant="body1" sx={ {
                mb : 1,
              } }>
                Other Colors
              </Typography>
              <Grid spacing={ 1 } container>
                { otherColors.map((otherColor) => {
                  // return jsx
                  return (
                    <Grid key={ `color-${otherColor.key.replace('.', '-')}` } item>
                      <ButtonGroup variant="contained">
                        <Button sx={ {
                          color       : theme.palette.getContrastText(otherColor.value),
                          background  : otherColor.value,
                          borderColor : `${otherColor.value}!important`,

                          '&:hover' : {
                            color      : theme.palette.getContrastText(otherColor.value),
                            background : otherColor.value,
                          }
                        } } onClick={ (e) => [setColor(otherColor), setOther(e.target)] }>
                          { otherColor.name }
                        </Button>
                        <Button sx={ {
                          color       : theme.palette.getContrastText(otherColor.value),
                          background  : otherColor.value,
                          borderColor : `${otherColor.value}!important`,

                          '&:hover' : {
                            color      : theme.palette.getContrastText(otherColor.value),
                            background : otherColor.value,
                          }
                        } } onClick={ (e) => updateOther(otherColor, null) }>
                          <FontAwesomeIcon icon={ faTimes } fixedWidth />
                        </Button>
                      </ButtonGroup>
                    </Grid>
                  );
                }) }
              </Grid>
            </Box>
            <Box>
              <Typography variant="body1" sx={ {
                mb : 1,
              } }>
                Background
              </Typography>
              <TextField fullWidth label="Background Image URL" margin="dense" value={ item?.theme?.shape?.backgroundImage || '' } onChange={ (e) => updateBackgroundImage(e.target.value) } />
              <TextField fullWidth label="Background Video URL" margin="dense" value={ item?.theme?.shape?.backgroundVideo || '' } onChange={ (e) => updateBackgroundVideo(e.target.value) } />
            </Box>
          </Stack>
        </Box>

        <Popover
          open={ !!primary }
          onClose={ () => setPrimary(null) }
          anchorEl={ primary }
          anchorOrigin={ {
            vertical   : 'bottom',
            horizontal : 'left',
          } }
        >
          <BlockPicker color={ color && primaryColors[color] } colors={ allColors } triangle="hide" onChange={ ({ hex }) => updatePrimary(color, hex) } />
        </Popover>

        <Popover
          open={ !!other }
          onClose={ () => setOther(null) }
          anchorEl={ other }
          anchorOrigin={ {
            vertical   : 'bottom',
            horizontal : 'left',
          } }
        >
          <BlockPicker color={ color?.value } colors={ allColors } triangle="hide" onChange={ ({ hex }) => updateOther(color, hex) } />
        </Popover>
      </ScrollBar>
      { (!!item?.id) && (
        <Box sx={ {
          flex          : 0,
          display       : 'flex',
          padding       : 2,
          borderTop     : `${theme.shape.borderWidth} solid ${theme.palette.divider}`,
          flexDirection : 'row',
        } }>
          <Stack direction="row" spacing={ 1 } ml="auto">
            <Button onClick={ () => onDelete() } color="error" loading={ !!themes.loading }>
              Delete Theme
            </Button>
            <Button onClick={ () => updatePublished(true) } variant={ item.publishedAt ? 'contained' : undefined } disabled={ !(item.name || '').length || !(item.description || '').length } loading={ !!themes.loading }>
              { item.publishedAt ? 'Unpublish Theme' : 'Publish Theme' }
            </Button>
          </Stack>
        </Box>
      ) }
    </Box>
  );
}

// export default
export default ThemeStoreCreate;