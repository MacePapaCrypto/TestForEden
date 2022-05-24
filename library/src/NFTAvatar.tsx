
// import react
import React from 'react';
import dotProp from 'dot-prop';
import { Avatar, Tooltip, useTheme } from '@mui/material';

// import font awesome
import { faUser } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// export nft
const NFTAvatar = (props = {}) => {
  // theme
  const theme = useTheme();

  // url
  let nftUrl = dotProp.get(props, 'user.avatar.image.url') || dotProp.get(props, 'item.image.image.url') || dotProp.get(props, 'image.url');

  // check height
  if (nftUrl && props.height) nftUrl = `${nftUrl}?h=${props.height}`;
  if (nftUrl && props.width) nftUrl = `${nftUrl}${props.height ? '&' : '?'}h=${props.height}`;

  // get title
  const avatarAlt = dotProp.get(props, 'user.avatar.name') || dotProp.get(props, 'item.image.name') || dotProp.get(props, 'user.username') || dotProp.get(props, 'user.id') || 'Anonymous';

  // base
  const base = (
    <Avatar
      src={ nftUrl }
      alt={ avatarAlt }
      width={ props.width }
      height={ props.height }
      onClick={ props.onClick }

      sx={ {
        width      : `${props.width}px`,
        height     : `${props.height || props.width}px`,
        bgcolor    : `rgba(255,255,255,0.1)`,
        transition : `all 0.2s ease`,

        '&:hover' : {
          bgcolor : theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[600],
        },

        ...(props.sx || {}),
      } }
    >
    { !nftUrl && (
      props.children || <FontAwesomeIcon icon={ faUser } />
    ) }
    </Avatar>
  );

  // check no tooltip
  if (props.noTooltip) return base;

  // base
  return (
    <Tooltip title={ avatarAlt } { ...(props.TooltipProps || {}) }>
      { base }
    </Tooltip>
  );
};

// export default
export default NFTAvatar;