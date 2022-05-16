
// import react
import React from 'react';
import Folder from '@mui/icons-material/Folder';
import toColor from 'string-to-color';
import initials from 'initials';
import { useDrag, useDrop } from 'react-dnd';
import { Box, Badge, Stack, Avatar, AvatarGroup, Tooltip, useTheme, CircularProgress } from '@mui/material';

// local
import Link from './Link';

// side bar item
const NFTSideBarSpace = (props = {}) => {
  // theme
  const theme = useTheme();

  // item
  const { item } = props;

  // use drag
  const [collected, drag, dragPreview] = props.isDraggable ? useDrag(() => ({
    item,
    type : item.type || 'segment',
    end  : (item, monitor) => {
      // save
      props.savePlace();
    },
    collect : (monitor) => {
      // dragging
      if (!monitor.isDragging()) return {};

      // set value
      props.setDragging(item);

      // return dragging
      return {
        isDragging : monitor.isDragging(),
      };
    }
  })) : [];

  // create drop targets
  const [topProps, top] = props.isDraggable ? useDrop(() => ({
    accept  : ['segment', 'group'],
    collect : (monitor) => {
      // on top
      if (!monitor.isOver()) return {};

      // set order
      props.setPlace(item.id, item.type === 'group' ? null : item.parent, item.order - .5);
      
      // return collect
      return {
        isOver  : monitor.isOver(),
        canDrop : monitor.canDrop()
      };
    }
  })) : [];
  const [middleProps, middle] = props.isDraggable ? useDrop(() => ({
    accept  : item.type === 'group' ? ['segment'] : ['segment', 'group'],
    collect : (monitor) => {
      // on top
      if (!monitor.isOver()) return {};

      // set order
      props.setPlace(item.id, item.parent || item.id, item.order);
      
      // return collect
      return {
        isOver  : monitor.isOver(),
        canDrop : monitor.canDrop()
      };
    }
  })) : [];
  const [bottomProps, bottom] = props.isDraggable ? useDrop(() => ({
    accept  : ['segment', 'group'],
    collect : (monitor) => {
      // on top
      if (!monitor.isOver()) return {};

      // set order
      props.setPlace(item.id, item.type === 'group' ? null : item.parent, item.order + .5);
      
      // return collect
      return {
        isOver  : monitor.isOver(),
        canDrop : monitor.canDrop()
      };
    }
  })) : [];

  // is group
  const isGroup    = props.item.type === 'group' || props.isGrouping;
  const children   = (props.spaces || []).filter((s) => s.parent === props.item.id);
  const spaceWidth = parseInt(theme.spacing(6).replace('px', ''));

  // push
  if (props.item.type !== 'group' && props.isGrouping) children.push(props.item);

  // return jsx
  return (
    <Box sx={ {
      cursor   : 'pointer',
      position : 'relative',
    } } ref={ props.isDraggable ? drag : null }>
      { !!props.isDraggable && (
        <>
          <Box sx={ {
            top      : -5,
            left     : 0,
            right    : 0,
            height   : '27.5%',
            zIndex   : props.isDragging || collected.isDragging ? 2 : 0,
            position : 'absolute',
          } } ref={ top } />
          <Box sx={ {
            top      : '25%',
            left     : 0,
            right    : 0,
            height   : '50%',
            zIndex   : props.isDragging || collected.isDragging ? 2 : 0,
            position : 'absolute',
          } } ref={ middle } />
          <Box sx={ {
            left     : 0,
            right    : 0,
            bottom   : -5,
            height   : '27.5%',
            zIndex   : props.isDragging || collected.isDragging ? 2 : 0,
            position : 'absolute',
          } } ref={ bottom } />
        </>
      ) }

        <Box>
          { isGroup ? (
            <Box sx={ {
              cursor          : 'pointer',
              borderRadius    : item.open ? `${(spaceWidth / 2)}px` : undefined,
              backgroundColor : item.open ? 'rgba(255,255,255,0.15)' : 'transparent',
            } }>
              { item.open ? (
                <Stack spacing={ 1 }>
                  <Tooltip title={ children.map((c) => c.name).filter((n) => n).join(', ') } placement="right">
                    <Avatar
                      sx={ {
                        width      : spaceWidth,
                        height     : spaceWidth,
                        background : 'transparent',
                      } }
                      onClick={ (e) => props.toggleOpen(item) }
                    >
                      <Folder />
                    </Avatar>
                  </Tooltip>
                  
                  { children.map((child) => {
                    // return jsx
                    return (
                      <NFTSideBarSpace
                        { ...props }

                        key={ `child-${child.id}` }
                        item={ child }

                        isActive={ props.active?.id === child.id }
                        isLoading={ props.loading === child.id }
                        isGrouping={ props.grouping?.id === child.id }
                      />
                    );
                  }) }
                </Stack>
              ) : (
                <Badge badgeContent={ 0 } color={ false ? 'primary' : 'info' } overlap="circular" sx={ {
                  '& .MuiBadge-badge' : {
                    top : '24%',
                  }
                } }>
                  <Tooltip title={ children.map((c) => c.name).filter((n) => n).join(', ') } placement="right">
                    <Box marginLeft="-5px">
                      <AvatarGroup max={ 2 } spacing={ 30 } onClick={ (e) => props.toggleOpen(item) }>
                        { children.map((child) => {
                          // return jsx
                          return (
                            <Avatar
                              key={ `child-${child.id}` }
                            >
                              { initials(child.name) }
                            </Avatar>
                          )
                        }) }
                      </AvatarGroup>
                    </Box>
                  </Tooltip>
                </Badge>
              ) }
            </Box>
          ) : (
            <Badge badgeContent={ item.alert?.all } color={ item.alert?.important ? 'primary' : 'info' } overlap="circular" sx={ {
              '& .MuiBadge-badge' : {
                top : '24%',
              }
            } }>
              { !props.isDragging && (
                <Box position="absolute" left={ -21 } width={ props.isActive ? 10 : 0 } top={ 5 } bottom={ 5 } sx={ {
                  transition      : 'all 0.2s ease',
                  borderRadius    : 2,
                  backgroundColor : item.image?.id ? theme.palette.primary.main : (item.color?.hex || toColor(item.name)),
                } } />
              ) }

              <Link to={ `/s/${item.id}` }>
                <Tooltip title={ item.name } placement="right">
                  <Avatar alt={ props.item.name } sx={ {
                    width      : spaceWidth,
                    height     : spaceWidth,
                    transition : 'all 0.2s ease',

                    background   : item.image?.id ? theme.palette.primary.main : toColor(item.name),
                    borderRadius : props.isActive ? `${(spaceWidth / 4)}px` : undefined,

                    '& .MuiCircularProgress-svg' : {
                      color : `${theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[600]}!important`,
                    }
                  } } onClick={ () => props.onActive(item) } src={ props.item.image?.image?.url ? `https://media.dashup.com/?width=${spaceWidth}&height=${spaceWidth}&src=${props.item.image?.image?.url}` : null }>
                    { props.isLoading ? (
                      <CircularProgress size={ 20 } thickness={ 5 } />
                    ) : initials(item.name) }
                  </Avatar>
                </Tooltip>
              </Link>
            </Badge>
          ) }
        </Box>
    </Box>
  );
};

// export default
export default NFTSideBarSpace;