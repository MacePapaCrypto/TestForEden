
// import react
import Tag from '@mui/icons-material/Tag';
import Link from './Link';
import React from 'react';
import { MenuItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';

// context
const NFTSideBarContext = (props = {}) => {
  // theme
  const theme = useTheme();

  // expand props
  const { item } = props;

  // check item
  if (!item) return null;

  // return jsx
  return (
    <MenuItem onClick={ () => props.onActive(item) } component={ Link } to={ `/c/${item.id}` } sx={ {
      borderRadius    : `${theme.shape.borderRadius}px`,
      backgroundColor : props.isActive ? `rgba(255, 255, 255, 0.08)` : undefined,
    } }>
      <ListItemIcon>
        <Tag />
      </ListItemIcon>
      <ListItemText>
        { item.name }
      </ListItemText>
    </MenuItem>
  );
};

// sidebar context
export default NFTSideBarContext;