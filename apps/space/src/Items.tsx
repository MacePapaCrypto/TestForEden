
// import react
import AliceCarousel from 'react-alice-carousel';
import React, { useRef, useMemo } from 'react';
import { Box, Stack, IconButton, Typography, useTheme } from '@mui/material';

// font awesome icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/pro-regular-svg-icons';

// import css
import 'react-alice-carousel/lib/alice-carousel.css';

// item
import Item from './Item';

/**
 * load app store items
 *
 * @param props 
 */
const AppSpaceItems = (props = {}) => {
  // use theme
  const theme = useTheme();
  
  // app
  const app = useApps({
    sort : props.sort,
  });

  // padding right
  const padding = parseInt(theme.spacing(2).replace('px', ''));

  // ref
  const slideRef = useRef(null);

  // items
  const items = useMemo(() => {
    // return items
    return app.apps.map((app, index) => {

      // return app
      return (
        <Item key={ app.id } index={ index } item={ app } size={ props.size } onSelect={ props.onSelect } />
      );
    });
  }, [app.apps?.length, app.apps.map((item) => item.id).join(',')]);

  // return jsx
  return (
    <Box py={ 2 }>
      <Stack direction="row" spacing={ 1 } sx={ {
        mb    : 2,
        px    : 2,
        width : '100%',

        alignItems : 'center',
      } }>
        <Typography variant="h5">
          { props.name }
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
        
        items={ items }
        paddingLeft={ padding }
        paddingRight={ padding }

        disableDotsControls
        disableButtonsControls
      />
    </Box>
  );
};

// export default
export default AppSpaceItems;