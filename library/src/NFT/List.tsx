// import dependencies
import React from 'react';
import NFTImage from './Image';
import { Grid, useTheme } from '@mui/material';

// nft list
const MoonNFTList = (props = {}) => {
  // use theme
  const theme = useTheme();

  // width/height
  const NFTWidth = props.width || 200;

  // return jsx
  return (
    <Grid container spacing={ 1 }>
      { (props.items || []).map((item) => {
        // return item
        return (
          <Grid item xs={ 3 } key={ item.id }>
            <NFTImage
              item={ item }
              width={ NFTWidth }
              height={ NFTWidth }
              onClick={ () => props.onPick && props.onPick(item) }

              sx={ {
                cursor       : 'pointer',
                maxWidth     : '100%',
                borderRadius : `${theme.shape.borderRadius}px`,
              } }
            />
          </Grid>
        );
      }) }
    </Grid>
  );
}

// export default
export default MoonNFTList;