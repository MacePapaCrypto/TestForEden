
// import react
import Ratio from 'react-ratio';
import dotProp from 'dot-prop';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import React, { useState } from 'react';
import { Box, Tooltip, Skeleton } from '@mui/material';

// export nft
const NFT = (props = {}) => {
  // state
  const [error, setError] = useState(false);

  // url
  let nftUrl = dotProp.get(props, 'item.image.url');

  // check height
  if (props.height) nftUrl = `${nftUrl}?h=${props.height}`;
  if (props.width) nftUrl = `${nftUrl}${props.height ? '&' : '?'}h=${props.height}`;

  // base
  const base = (
    <Box ref={ props.ref } sx={ {
      '& img' : {
        ...(props.sx || {}),

        width  : 'auto',
        height : 'auto',
      }
    } }>
      <LazyLoadImage
        src={ nftUrl }
        alt={ props.item.name }
        width={ props.width }
        height={ props.height }
        onClick={ props.onClick }
        onError={ () => setError(true) }
        placeholder={ (
          <Ratio ratio={ (props.width || 100) / (props.height || props.width || 100) }>
            <Skeleton variant={ props.variant || 'rounded' } sx={ {
              width     : '100%!important',
              height    : '100%!important',
              minHeight : '100%',
            } } />
          </Ratio>
        ) }
      />
    </Box>
  );

  // tooltip
  if (props.noTooltip) return base;

  // return jsx
  return (
    <Tooltip
      title={ props.item.name }
    >
      { base }
    </Tooltip>
  );
};

// export default
export default NFT;