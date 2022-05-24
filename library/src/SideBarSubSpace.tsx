// import react
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { MenuItem, ListItemIcon, Avatar, ListItemText } from '@mui/material';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHashtag, faFeed, faGalleryThumbnails } from '@fortawesome/pro-regular-svg-icons';

// create nft side bar sub space
const NFTSideBarSubSpace = (props = {}) => {
  // ref
  const ref = useRef(null);

  // browse
  const { item, browse, onSelect } = props;

  // icon
  const subSpaceIcon = {
    chat    : faHashtag,
    feed    : faFeed,
    gallery : faGalleryThumbnails,
  };

  const [{ handlerId }, drop] = useDrop({
    accept  : 'subSpace',
    collect : (monitor) => {
      // return
      return {
        handlerId : monitor.getHandlerId(),
      }
    },
    hover : (item, monitor) => {
      // check ref
      if (!ref.current) return;

      // get index
      const dragIndex = item.index;
      const hoverIndex = props.index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      // Time to actually perform the action
      props.onMove(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  // use drag
  const [{ isDragging }, drag] = useDrag({
    type : 'subSpace',
    item : () => {
      return {
        id    : item.id,
        index : props.index,
      };
    },
    end  : (item, monitor) => {
      // save
      props.onEnd();
    },
    collect : (monitor) => ({
      isDragging : monitor.isDragging(),
    }),
  });

  // create ref
  drag(drop(ref));
  
  // return jsx
  return (
    <MenuItem ref={ props.can('subspace:create') ? ref : undefined } selected={ browse.subSpace?.id === item.id } onClick={ () => onSelect(item) } sx={ {
      opacity : isDragging ? 0 : 1,
    } } data-handler-id={ handlerId }>
      <ListItemIcon>
        { item.image?.image?.url ? (
          <Avatar src={ `${item.image.image.url}?w=${24}&h=${24}` } alt={ item.image.value.name } sx={ {
            width        : 24,
            height       : 24,
            marginTop    : `-1px`,
            marginLeft   : `-5px`,
            marginBottom : `-1px`,
          } } />
        ) : (
          <FontAwesomeIcon icon={ subSpaceIcon[item.feed || 'feed'] } size="sm" />
        ) }
      </ListItemIcon>
      <ListItemText>
        { item.name }
      </ListItemText>
    </MenuItem>
  );
}

// export default
export default NFTSideBarSubSpace;