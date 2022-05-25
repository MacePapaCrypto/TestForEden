
import moment from 'moment';
import dotProp from 'dot-prop';
import humanNumber from 'human-number';
import { useIntersectionObserver } from 'usehooks-ts';
import React, { useRef, useEffect, useState } from 'react';
import { Box, Badge, Stack, useTheme, Tooltip, IconButton, Typography } from '@mui/material';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faMoon, faComment, faSpinnerThird, faShareNodes } from '@fortawesome/pro-regular-svg-icons';
import {
  faMoon as faMoonSolid,
  faComment as faCommentSolid,
  faShareNodes as faShareNodesSolid,
} from '@fortawesome/pro-solid-svg-icons';

// local hooks
import useId from './useId';
import useAuth from './useAuth';
import useLike from './useLike';
import useTyping from './useTyping';
import useBrowse from './useBrowse';
import useSocket from './useSocket';

// embeds
import EmbedVideo from './EmbedVideo';
import EmbedContract from './EmbedContract';

// local elements
import Link from './Link';
import PostList from './PostList';
import ScrollBar from './ScrollBar';
import NFTAvatar from './NFTAvatar';
import PostCreate from './PostCreate';
import PostTyping from './PostTyping';
import PostMarkdown from './PostMarkdown';

// timeout
let timeout;
const debounce = (fn, to = 200) => {
  // clear timeout
  clearTimeout(timeout);

  // timeout
  timeout = setTimeout(fn, to);
};

// nft post
const NFTPost = (props = {}) => {
  // theme
  const uuid = useId();
  const like = useLike(props.item, props.item?.liked, 'post');
  const auth = useAuth();
  const theme = useTheme();
  const browse = useBrowse();
  const typing = useTyping({
    thread : props.item?.id,
  });
  const socket = useSocket();

  // state
  const [updated, setUpdated] = useState(new Date());

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
  const getEmbeds = (types = ['photo', 'video', 'contract']) => {
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
    if (browse.subSpace?.id) {
      // remove segment
      links = links.filter((l) => l.ref !== `space:${browse.subSpace.id}`);
    }

    // return links
    return links;
  };

  // on post
  const onRespond = async (value) => {
    // done typing
    typing.update(false);

    // check add
    if (!auth.account) {
      // login
      auth.login();

      // login
      return false;
    }

    // uuid
    const tempId = uuid();
  
    // temp id
    let loadedPost;
    let foundPost = {
      id        : tempId,
      temp      : tempId,
      feed      : 'response',
      status    : 'posting',
      thread    : item.id,
      account   : auth.account ? auth.account.toLowerCase() : null,
      createdAt : new Date(),
      updatedAt : new Date(),
      
      ...value,
    };

    // add to children
    if (!item.children) item.children = [];
    item.replied = true;
    item.children.push(foundPost);

    // updated
    setUpdated(new Date());

    // on respond
    props.onRespond && props.onRespond(null);

    // load
    loadedPost = await socket.post('/post', {
      temp    : tempId,
      feed    : 'response',
      status  : 'posting',
      thread  : item.id,
      account : auth.account ? auth.account.toLowerCase() : null,
      
      ...value,
    });

    // push again
    Object.keys(loadedPost).forEach((key) => {
      foundPost[key] = loadedPost[key];
    });

    // updated
    setUpdated(new Date());
  };

  // on key up
  const onKeyDown = async () => {
    // debounce
    debounce(() => {
      // call typing
      typing.update(true);
    });
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
      mt   : props.feed === 'chat' && !props.inThread && !props.noMargin ? 2 : undefined,
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
                <NFTAvatar user={ item.user } sx={ {
                  color : `rgba(255, 255, 255, 0.25)`,
                  
                  ...(props.feed === 'chat' ? {
                    top      : 0,
                    left     : 0,
                    position : 'absolute',
                  } : {})
                } } height={ avatarWidth } width={ avatarWidth } />
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
        <Stack flex={ 1 } spacing={ props.feed === 'chat' ? .25 : .5 }>

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
                  ...(props.feed === 'chat' ? theme.typography.body2 : theme.typography.body1),
                  
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

          { /* POST REPLY */ }
          { props.feed !== 'chat' && !!item.replyTo?.account && (
            <Box>
              <Box p={ 1 } border={ `1px solid ${theme.palette.divider}` } borderRadius={ `${theme.shape.borderRadius * 2}px` }>
                <NFTPost
                  { ...props }

                  item={ item.replyTo }
                  feed="chat"
                  inThread={ false }
                  noMargin

                  extra={ (
                    <Typography component={ Link } to={ `/p/${item.replyTo.id}` } sx={ {
                      color : theme.palette.primary.main,
                      ...theme.typography.body2,
                    } }>
                      View Post
                    </Typography>
                  ) }
                />
              </Box>
            </Box>
          ) }
          { /* / POST REPLY */ }

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
                    if (embed.type === 'contract') Embed = EmbedContract;

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
            <Stack direction="row" spacing={ 1 } sx={ {
              '& .MuiBadge-badge': {
                top     : 14,
                right   : 5,
                border  : `2px solid ${theme.palette.background.default}`,
                padding : '0 4px',
              },
            } }>
              <Tooltip title="Moon Post">
                <Badge badgeContent={ like.count ? humanNumber(like.count) : 0 } color="primary">
                  <IconButton onClick={ () => like.toggle() }>
                    { like.loading ? (
                      <FontAwesomeIcon icon={ faSpinnerThird } size="sm" className="fa-spin" />
                    ) : (
                      <FontAwesomeIcon icon={ like.like ? faMoonSolid : faMoon } size="sm" />
                    ) }
                  </IconButton>
                </Badge>
              </Tooltip>
              <Tooltip title="Reply">
                <Badge badgeContent={ item.count?.replies ? humanNumber(item.count.replies) : 0 } color="primary">
                  <IconButton onClick={ () => props.onRespond && props.onRespond(props.isResponding ? null : item) }>
                    <FontAwesomeIcon icon={ props.isResponding || item.replied ? faCommentSolid : faComment } size="sm" />
                  </IconButton>
                </Badge>
              </Tooltip>
              <Tooltip title="Repost">
                <IconButton onClick={ () => {} }>
                  <FontAwesomeIcon icon={ false ? faShareNodesSolid : faShareNodes } size="sm" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Options">
                <IconButton sx={ {
                  ml : 'auto!important',
                } }>
                  <FontAwesomeIcon icon={ faEllipsis } size="sm" />
                </IconButton>
              </Tooltip>
            </Stack>
          ) }
          { /* / POST SHARE LINE */ }

          { /* POST SUBS */ }
          { !!props.withReplies && !!(item.children || []).length && (
            <Box>
              <PostList
                feed="chat"
                posts={ item.children }
                PostProps={ {
                  history  : props.history,
                  noAvatar : true,
                } }
              />
              <Typography component={ Link } to={ `/p/${item.id}` } sx={ {
                color : theme.palette.primary.main,
                ...theme.typography.body2,
              } }>
                View Thread
              </Typography>
              <PostTyping
                typing={ typing.typing }
              />
            </Box>
          ) }
          { /* / POST SUBS */ }

          { /* POST RESPOND */ }
          { !!props.isResponding && (
            <PostCreate
              isOpen
              noAvatar

              space={ item.space }
              onPost={ onRespond }
              replyTo={ item }
              onKeyDown={ onKeyDown }
            />
          ) }
          { /* / POST RESPOND */ }

          { /* EXTRA */ }
          { props.extra }
          { /* / EXTRA */ }

        </Stack>
        { /* / POST BODY */ }

      </Stack>
    </Box>
  );
};

// export default
export default NFTPost;