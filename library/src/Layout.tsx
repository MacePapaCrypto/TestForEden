
import Measure from 'react-measure';
import GridLayout from 'react-grid-layout';
import { Box, useTheme } from '@mui/material';
import React, { useState } from 'react';

// scss
import 'react-resizable/css/styles.css';
import 'react-grid-layout/css/styles.css';

// nft layout
const NFTLayout = (props = {}) => {
  // theme
  const theme = useTheme();

  // use state
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  // margin
  const margin = parseInt(theme.spacing(2).replace('px', ''));

  // return jsx
  return (
    <Measure
      bounds
      onResize={ (contentRect) => {
        // set
        setWidth(contentRect.bounds.width);
        setHeight(contentRect.bounds.height);
      } }
    >
      { ({ measureRef }) => {
        // return jsx
        return (
          <Box ref={ measureRef } flex={ 1 }>
            { !!width && (
              <GridLayout
                cols={ 12 }
                width={ width }
                margin={ [margin, margin] }
                rowHeight={ 30 }
                className="layout"
                containerPadding={ [0, 0] }
                { ...props }
              />
            ) }
          </Box>
        )
      } }
    </Measure>
  );
};

// export default
export default NFTLayout;