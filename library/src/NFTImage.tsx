
// import react
import Ratio from 'react-ratio';
import dotProp from 'dot-prop';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import React, { useState } from 'react';
import { Box, useTheme, Avatar, Tooltip, Skeleton } from '@mui/material';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImageSlash } from '@fortawesome/pro-regular-svg-icons';

// export nft
const NFTImage = (props = {}) => {
  // theme
  const theme = useTheme();

  // state
  const [error, setError] = useState(false);

  // url
  let nftUrl = dotProp.get(props, 'item.image.url');

  // check height
  if (props.height) nftUrl = `${nftUrl}?h=${props.height}`;
  if (props.width) nftUrl = `${nftUrl}${props.height ? '&' : '?'}w=${props.width}`;

  // base
  const base = (
    <Box ref={ props.ref } sx={ {
      '& img' : {
        width  : 'auto',
        height : 'auto',

        ...(props.variant === 'rounded' ? {
          borderRadius : `${theme.shape.borderRadius}px`,
        } : {}),

        ...(props.sx || {}),
      }
    } }>
      { error ? (
        <Avatar
          width={ props.width }
          height={ props.height }
          variant={ props.variant }
          onClick={ props.onClick }
    
          sx={ {
            width      : `${props.width}px`,
            color      : `rgba(255, 255, 255, 0.25)`,
            height     : `${props.height || props.width}px`,
            bgcolor    : `rgba(255,255,255,0.1)`,
            transition : `all 0.2s ease`,
    
            '&:hover' : {
              bgcolor : theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[600],
            },
    
            ...(props.sx || {}),
          } }
        >
          <FontAwesomeIcon icon={ faImageSlash } />
        </Avatar>
      ) : (
        <LazyLoadImage
          src={ nftUrl }
          alt={ props.item.name }
          width={ props.width }
          height={ props.height }
          onClick={ props.onClick }
          onError={ () => setError(true) }
          placeholder={ (
            <Ratio ratio={ (props.width || 100) / (props.height || props.width || 100) }>
              { props.placeholder || (
                <Skeleton variant={ props.variant || 'rounded' } sx={ {
                  width     : '100%!important',
                  height    : '100%!important',
                  minHeight : '100%',
                } } />
              ) }
            </Ratio>
          ) }
        />
      ) }
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
export default NFTImage;