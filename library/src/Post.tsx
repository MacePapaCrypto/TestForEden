
import moment from 'moment';
import dotProp from 'dot-prop';
import { useIntersectionObserver } from 'usehooks-ts';
import React, { useRef, useEffect } from 'react';
import { Box, Stack, Avatar, useTheme, Tooltip, IconButton } from '@mui/material';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faHeart, faComment, faShareNodes } from '@fortawesome/pro-regular-svg-icons';

// local hooks
import useTyping from './useTyping';
import useBrowse from './useBrowse';

// embeds
import EmbedVideo from './EmbedVideo';
import EmbedCollection from './EmbedCollection';

// local elements
import Link from './Link';
import PostList from './PostList';
import ScrollBar from './ScrollBar';
import PostTyping from './PostTyping';
import PostMarkdown from './PostMarkdown';

// nft post
const NFTPost = (props = {}) => {
  // theme
  const theme = useTheme();
  const browse = useBrowse();
  const typing = useTyping({
    thread : props.item?.id,
  });

  // use ref
  const postRef = useRef(null);
  const postInt = useIntersectionObserver(postRef, {
    threshold : 1,
  });
  const postLte = useIntersectionObserver(postRef, {
    threshold : .1,
  });

  // get item
  const { item } = props;

  // get content
  const getEmbeds = (types = ['photo', 'video', 'collection']) => {
    // return embeds
    return (item.embeds || []).filter((e) => e).filter((e) => types.includes(e.type));
  };

  // get member
  const getMember = (key) => {
    // check member
    if (!props.item?.member) return;

    // get from member
    return dotProp.get(props.item.member, key);
  };

  // get member
  const getRoles = () => {
    // check member
    if (!browse.segment) return;
    if (!props.item?.member) return;

    // get roles
    const roles = (getMember('roles') || []).map((id) => (browse.segment.roles || []).find((r) => r.id === id)).filter((r) => r);

    // get from member
    return roles.length ? roles : undefined;
  };

  // get links
  const getLinks = () => {
    // links
    let links = (item.links || []);

    // check space
    if (item.space?.id && !links.find((l) => l.ref === `space:${item.space.id}`)) {
      // add to start
      links.unshift({
        to   : `/s/${item.space.id}`,
        ref  : `space:${item.space.id}`,
        type : 'space',
        name : item.space.name,
      });
    }

    // remove if in segment
    if (browse.space?.id) {
      // remove segment
      links = links.filter((l) => l.ref !== `space:${browse.space.id}`);
    }

    // return links
    return links;
  };

  // on visible
  useEffect(() => {
    // check visibility
    if (!postInt?.isIntersecting) {
      if (props.onHidden) props.onHidden(postRef, item);
    } else {
      if (props.onVisible) props.onVisible(postRef, item);
    }
  }, [postInt?.isIntersecting]);
  
  // avatar width
  const avatarWidth = props.feed === 'chat' ? 40 : 50;

  // return jsx
  return (
    <Box sx={ {
      mt   : props.feed === 'chat' && !props.inThread ? 1 : undefined,
      flex : 1,
    } } ref={ postRef }>
      <Stack spacing={ 2 } direction="row">

        { /* POST AVATAR `*/ }
        { !props.noAvatar && (
          <Box display="flex" flexDirection="column" sx={ {
            flex     : 0,
            position : 'relative',
            minWidth : avatarWidth,
            maxWidth : avatarWidth,
          } }>
            { (!props.inThread || props.feed !== 'chat') && (
              <Link to={ `/a/${item.account}` }>
                <Tooltip title={ item.user?.avatar?.value?.name || item.account }>
                  <Avatar alt={ item.user?.avatar?.value?.name || item.account } sx={ {
                    width  : avatarWidth,
                    height : avatarWidth,
        
                    ...(props.feed === 'chat' ? {
                      top      : 0,
                      left     : 0,
                      position : 'absolute',
                    } : {})
                  } } src={ item.user?.avatar?.image?.url ?  `https://media.dashup.com/?width=${avatarWidth}&height=${avatarWidth}&src=${item.user.avatar.image.url}` : null } />
                </Tooltip>
              </Link>
            ) }

            { !!(props.feed !== 'chat' && !!props.withReplies) && (
              <Box 
                sx={ {
                  top        : `calc(${avatarWidth}px + ${theme.spacing(2)})`,
                  left       : `calc(50% - .5px)`,
                  width      : '1px',
                  bottom     : 0,
                  position   : 'absolute',
                  background : theme.palette.divider,
                } }
              />
            ) }
          </Box>
        ) }
        { /* / POST AVATAR */ }

        { /* POST BODY */ }
        <Stack flex={ 1 } spacing={ .5 }>

          { /* POST USER `*/ }
          { (!props.inThread || props.feed !== 'chat') && (
            <Stack direction="row" spacing={ 1 } alignItems="center">
              { /* USERNAME */ }
              <Stack spacing={ 1 } direction="row" alignItems="center" sx={ {
                flex : 1,
              } }>
                <Link to={ `/a/${item.account}` }>
                  <Tooltip title={ getRoles() ? getRoles()[0].name : 'Visitor' }>
                    <Box component="span" sx={ {
                      ...(props.feed === 'chat' ? theme.typography.body2 : theme.typography.body1),

                      color      : getRoles() ? getRoles()[0].color : theme.palette.text.primary,
                      fontWeight : theme.typography.fontWeightMedium,
                    } }>
                      { item.account === '0x9d4150274f0a67985a53513767ebf5988cef45a4' ? 'eden' : 'not eden' }
                    </Box>
                  </Tooltip>
                </Link>
                <Tooltip title={ item.account }>
                  <Box component="a" target="_BLANK" href={ `https://ftmscan.com/address/${item.account}` } color="rgba(255, 255, 255, 0.4)" sx={ {
                    ...theme.typography.body2,

                    textDecoration : 'none',
                  } }>
                    { `${item.account.substring(0, 8)}` }
                  </Box>
                </Tooltip>
                <Tooltip title={ moment(item.createdAt).format() }>
                  <Box component="span" color="rgba(255, 255, 255, 0.4)" sx={ {
                    ...theme.typography.body2,
                  } }>
                    { moment(item.createdAt).fromNow() }
                  </Box>
                </Tooltip>
              </Stack>
              { /* / USERNAME */ }
            </Stack>
          ) }
          { /* / POST USER */ }
          
          { /* POST CONTENT */ }
          { !!item.content && (
            <Box display="block">
              <Box
                sx={ {
                  ...(theme.typography.body1),
                  
                  wordBreak  : 'break-word',
                  whiteSpace : 'pre',
                } }
              >
                <PostMarkdown content={ item.content } />
              </Box>
            </Box>
          ) }
          { /* / POST CONTENT */ }

          { /* POST LINKS */ }
          { props.feed !== 'chat' && !!getLinks().length && (
            <Stack spacing={ .5 } direction="row" sx={ {
              ...theme.typography.body2,
            } }>
              { getLinks().map((l) => {
                // return link
                return (
                  <Link to={ l.to } key={ l.ref }>
                    <Tooltip title={ `${l.type}: ${l.name}` }>
                      <Box component="span" sx={ {
                        color        : theme.palette.primary.main,
                        maxWidth     : theme.spacing(15),
                        overflow     : 'hidden',
                        whiteSpace   : 'nowrap',
                        textOverflow : 'ellipsis'
                      } }>
                        { l.name }
                      </Box>
                    </Tooltip>
                  </Link>
                );
              }) }
            </Stack>
          ) }
          { /* / POST LINKS */ }

          { /* EMBED */ }
          { !!getEmbeds().length && (
            <Box>
              <ScrollBar>
                <Stack direction={ props.feed === 'chat' ? 'column' : 'row' } spacing={ 1 }>
                  { getEmbeds().map((embed, i) => {
                    // type
                    let Embed = null;

                    // set embed
                    if (embed.type === 'video') Embed = EmbedVideo;
                    if (embed.type === 'collection') Embed = EmbedCollection;

                    // check embed
                    if (!Embed) return;

                    // return jsx
                    return (
                      <Embed
                        key={ `embed-${embed.url}` }
                        feed={ props.feed }
                        post={ item }
                        item={ embed }
                        index={ i }
                        visible={ postLte?.isIntersecting }
                        playing={ postInt?.isIntersecting && props.playing?.id === item.id && props.playing?.index === i }
                        setPlaying={ props.setPlaying }
                        embedWidth={ props.feed === 'chat' ? theme.spacing(50) : (getEmbeds().length > 1 ? '90%' : '100%') }

                        { ...(props.EmbedProps || {}) }
                      />
                    );
                  }) }
                </Stack>
              </ScrollBar>
            </Box>
          ) }
          { /* / EMBED */ }

          { /* POST SHARE LINE */ }
          { !!(props.feed !== 'chat') && (
            <Stack direction="row" spacing={ 1 }>
              <Tooltip title="Like Post">
                <IconButton>
                  <FontAwesomeIcon icon={ faHeart } size="xs" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reply">
                <IconButton>
                  <FontAwesomeIcon icon={ faComment } size="xs" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton>
                  <FontAwesomeIcon icon={ faShareNodes } size="xs" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Options">
                <IconButton sx={ {
                  ml : 'auto!important',
                } }>
                  <FontAwesomeIcon icon={ faEllipsis } size="xs" />
                </IconButton>
              </Tooltip>
            </Stack>
          ) }
          { /* / POST SHARE LINE */ }

          { /* POST SUBS */ }
          { !!props.withReplies && !!(item.children || []).length && !!item.count?.replies && (
            <Box>
              <PostList
                feed="chat"
                posts={ item.children }
                PostProps={ {
                  history  : props.history,
                  noAvatar : true,
                } }
              />
              <PostTyping
                typing={ typing.typing }
              />
            </Box>
          ) }
          { /* / POST SUBS */ }

        </Stack>
        { /* / POST BODY */ }

      </Stack>
    </Box>
  );
};

// export default
export default NFTPost;