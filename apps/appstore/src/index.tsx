
// import react app
import AliceCarousel from 'react-alice-carousel';
import React, { useRef, useState } from 'react';
import { App, ScrollBar, useSocket } from '@moonup/ui';
import { Box, Stack, Chip, Card, CardMedia, CardContent, Button, CardActions, Typography, useTheme, IconButton } from '@mui/material';

// import css
import 'react-alice-carousel/lib/alice-carousel.css';

// font awesome icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/pro-regular-svg-icons';

/**
 * create space app
 *
 * @param props
 */
const SpaceApp = (props = {}) => {
  // theme
  const theme = useTheme();
  const socket = useSocket();

  // use state
  const [chipData, setChipData] = useState([
    { key: 0, label: 'Angular' },
    { key: 1, label: 'jQuery' },
    { key: 2, label: 'Polymer' },
    { key: 3, label: 'React' },
    { key: 4, label: 'Vue.js' },
  ]);

  // ref
  const slideRef = useRef(null);

  // default props
  const defaultProps = {
    position : {
      x : .1,
      y : .1,

      width  : .8,
      height : .8,
    },
  };

  const responsive = {
    0    : { items : 1 },
    568  : { items : 2 },
    1024 : { items : 3 },
  };

  // create items
  const createItems = (amount = 5, width = 345, includeDescription = true) => {
    // create items array
    const createArr = [];

    // loop
    for (let i = 0; i < amount; i++) {
      createArr.push(i);
    }

    // return items
    return createArr.map((item) => {
      // return jsx
      return (
        <Card sx={ {
          border      : `${theme.shape.borderWidth} solid ${theme.palette.divider}`,
          maxWidth    : width,
          marginRight : 2,
        } } data-value={ item }>
          <CardMedia
            component="img"
            height="140"
            image="https://mui.com/static/images/cards/contemplative-reptile.jpg"
            alt="green iguana"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div" sx={ {
              mb : includeDescription ? undefined : 0,
            } }>
              Lizard
            </Typography>
            { !!includeDescription && (
              <Typography variant="body2" color="text.secondary">
                Lizards are a widespread group of squamate reptiles, with over 6,000
                species, ranging across all continents except Antarctica
              </Typography>
            ) }
          </CardContent>
          <CardActions>
            <Button size="small">Share</Button>
            <Button size="small">Learn More</Button>
          </CardActions>
        </Card>
      );
    });
  };

  // padding right
  const paddingRight = parseInt(theme.spacing(3).replace('px', ''));

  // return jsx
  return (
    <App
      name="App Name"

      menu={ (
        <Box>
          APP STORE MENU
        </Box>
      ) }

      ready={ true }
      default={ defaultProps }
    >
      <Box sx={ {
        borderBottom : `${theme.shape.borderWidth} solid ${theme.palette.divider}`,
      } }>
        <ScrollBar>
          <Stack direction="row" spacing={ 1 } sx={ {
            padding : 2,
            display : 'inline-flex',
          } }>
            { chipData.map((data) => {
              // return jsx
              return (
                <Chip
                  key={ data.key }
                  label={ data.label }
                />
              );
            }) }
          </Stack>
        </ScrollBar>
      </Box>
      <Box flex={ 1 } display="flex">
        <ScrollBar isFlex>
          <Box padding={ 2 }>
            <Stack direction="row" spacing={ 1 } sx={ {
              mb    : 2,
              width : '100%',

              alignItems : 'center',
            } }>
              <Typography variant="h5">
                Featured Apps
              </Typography>
              
              <Box ml="auto!important">
                <IconButton onClick={ () => slideRef.current?.slidePrev() }>
                  <FontAwesomeIcon icon={ faChevronLeft } fixedWidth />
                </IconButton>
                <IconButton onClick={ () => slideRef.current?.slideNext() }>
                  <FontAwesomeIcon icon={ faChevronRight } fixedWidth />
                </IconButton>
              </Box>
            </Stack>
            <AliceCarousel
              ref={ slideRef }
              autoWidth
              mouseTracking
              
              items={ createItems(5) }
              paddingRight={ paddingRight }

              disableDotsControls
              disableButtonsControls
            />
          </Box>

          <Box padding={ 2 }>
            <Stack direction="row" spacing={ 1 } sx={ {
              mb         : 2,
              width      : '100%',
              alignItems : 'center',
            } }>
              <Typography variant="h5">
                Most Downloaded Apps
              </Typography>
              
              <Box ml="auto!important">
                <IconButton onClick={ () => slideRef.current?.slidePrev() }>
                  <FontAwesomeIcon icon={ faChevronLeft } fixedWidth />
                </IconButton>
                <IconButton onClick={ () => slideRef.current?.slideNext() }>
                  <FontAwesomeIcon icon={ faChevronRight } fixedWidth />
                </IconButton>
              </Box>
            </Stack>
            <AliceCarousel
              ref={ slideRef }
              autoWidth
              mouseTracking
              
              items={ createItems(5, 250, false) }
              paddingRight={ paddingRight }

              disableDotsControls
              disableButtonsControls
            />
          </Box>
        </ScrollBar>
      </Box>
    </App>
  );
};

// export default
export default SpaceApp;