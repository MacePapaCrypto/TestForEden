// import dependencies
import NFT from './NFT';
import React from 'react';
import { Grid, useTheme } from '@mui/material';

// nft list
const NFTList = (props = {}) => {
  // use theme
  const theme = useTheme();

  // width/height
  const NFTWidth = props.width || 200;

  // return jsx
  return (
    <Grid container spacing={ 1 }>
      { props.items.map((item) => {
        // return item
        return (
          <Grid item xs={ 3 } key={ item.id }>
            <NFT
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
export default NFTList;