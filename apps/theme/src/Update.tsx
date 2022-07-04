
// import react
import dotProp from 'dot-prop';
import { BlockPicker } from 'react-color';
import React, { useState } from 'react';
import { Box, Stack, Grid, Button, Divider, TextField, ButtonGroup, Popover, Typography, useTheme } from '@mui/material';

// font awesome icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/pro-regular-svg-icons';

/**
 * app theme create
 *
 * @param props 
 */
const AppThemeCreate = (props = {}) => {
  // use theme
  const theme = useTheme();

  // picker
  const [color, setColor] = useState(null);
  const [other, setOther] = useState(null);
  const [primary, setPrimary] = useState(null);

  // color keys
  const primaryKeys = ['primary', 'secondary', 'success', 'error', 'info', 'warning'];

  // colors
  const primaryColors = primaryKeys.reduce((accum, color) => {
    // color
    accum[color] = dotProp.get(props.theme, `theme.palette.${color}.main`) || theme.palette[color].main;

    // return accum
    return accum;
  }, {});

  // other keys
  const otherColors = [
    {
      key   : 'divider',
      name  : 'Divider',
      value : dotProp.get(props.theme, 'theme.palette.divider') || theme.palette.divider,
    },
    {
      key   : 'border.primary',
      name  : 'Primary Border',
      value : dotProp.get(props.theme, 'theme.palette.border.primary') || theme.palette.border.primary,
    },
    {
      key   : 'border.active',
      name  : 'Active Border',
      value : dotProp.get(props.theme, 'theme.palette.border.active') || theme.palette.border.active,
    },
    {
      key   : 'background.paper',
      name  : 'Window Background',
      value : dotProp.get(props.theme, 'theme.palette.background.paper') || theme.palette.background.paper,
    },
    {
      key   : 'background.default',
      name  : 'Desktop Background',
      value : dotProp.get(props.theme, 'theme.palette.background.default') || theme.palette.background.default,
    },
    {
      key   : 'text.primary',
      name  : 'Text Color',
      value : dotProp.get(props.theme, 'theme.palette.text.primary') || theme.palette.text.primary,
    },
  ];

  // update color
  const updatePrimary = (c, hex) => {
    // set
    const newTheme = props.theme?.theme || {};

    // set
    if (hex) {
      dotProp.set(newTheme, `palette.${c}.main`, hex);
    } else {
      dotProp.delete(newTheme, `palette.${c}`);
    }

    // update
    props.update(newTheme);
  };

  // update color
  const updateOther = ({ key }, hex) => {
    // set
    const newTheme = props.theme?.theme || {};

    // set
    if (hex) {
      dotProp.set(newTheme, `palette.${key}`, hex);
    } else {
      dotProp.delete(newTheme, `palette.${key}`)
    }

    // update
    props.update(newTheme);
  };

  /**
   * update background image
   *
   * @param value 
   */
  const updateBackgroundImage = (value) => {
    // set
    const newTheme = props.theme?.theme || {};

    // set
    if (value?.length) {
      dotProp.set(newTheme, 'shape.backgroundImage', value);
    } else {
      dotProp.delete(newTheme, 'shape.backgroundImage')
    }

    // update
    props.update(newTheme);
  };

  /**
   * update background image
   *
   * @param value 
   */
  const updateBackgroundVideo = (value) => {
    // set
    const newTheme = props.theme?.theme || {};

    // set
    if (value?.length) {
      dotProp.set(newTheme, 'shape.backgroundVideo', value);
    } else {
      dotProp.delete(newTheme, 'shape.backgroundVideo')
    }

    // update
    props.update(newTheme);
  };

  // all colors
  const allColors = Array.from(new Set([...Object.values(primaryColors), ...(otherColors.map((c) => c.value))]));

  // return jsx
  return (
    <Box padding={ 2 }>
      <Stack spacing={ 1 }>
        <Typography variant="body1">
          Theme Colors
        </Typography>
        <Box>
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
        <Divider />
        <Typography variant="body1">
          Other Colors
        </Typography>
        <Box>
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
        <Typography variant="body1">
          Background
        </Typography>
        <Box>
          <TextField fullWidth label="Background Image URL" margin="dense" value={ props.theme?.theme?.shape?.backgroundImage || '' } onChange={ (e) => updateBackgroundImage(e.target.value) } />
          <TextField fullWidth label="Background Video URL" margin="dense" value={ props.theme?.theme?.shape?.backgroundVideo || '' } onChange={ (e) => updateBackgroundVideo(e.target.value) } />
        </Box>
      </Stack>

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
    </Box>
  );
}

// export default
export default AppThemeCreate;