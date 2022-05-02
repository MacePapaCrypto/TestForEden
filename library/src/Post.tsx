import Tag from '@mui/icons-material/Tag';
import Embed from './Embed';
import Share from '@mui/icons-material/Share';
import Forum from '@mui/icons-material/Forum';
import moment from 'moment';
import ScrollBar from './ScrollBar';
import ReactMarkdown from 'react-markdown';
import React, { useRef, useEffect } from 'react';
import { useIntersectionObserver } from 'usehooks-ts';
import { Box, Chip, Stack, Avatar, useTheme } from '@mui/material';

// nft post
const NFTPost = (props = {}) => {
  // theme
  const theme = useTheme();

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
  const getEmbeds = (types = ['photo', 'video']) => {
    // return embeds
    return (item.embeds || []).filter((e) => e).filter((e) => types.includes(e.type));
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

  // return jsx
  return (
    <Box sx={ {
      mt   : props.feed === 'chat' && !props.inThread ? 2 : undefined,
      flex : 1,
    } } ref={ postRef }>
      <Stack spacing={ 2 } direction="row">
        { /* POST USER `*/ }
        <Box display="flex" flexDirection="column" sx={ {
          position : 'relative',
          minWidth : props.feed === 'chat' ? '40px' : '50px',
          maxWidth : props.feed === 'chat' ? '40px' : '50px',
        } }>
          { (!props.inThread || props.feed !== 'chat') && (
            <Avatar alt="User 1" src={ null } sx={ {
              width  : props.feed === 'chat' ? 40 : 50,
              height : props.feed === 'chat' ? 40 : 50,

              ...(props.feed === 'chat' ? {
                top      : 0,
                left     : 0,
                position : 'absolute',
              } : {})
            } } />
          ) }
        </Box>
        { /* / POST USER */ }

        <Stack spacing={ props.feed === 'chat' ? 0 : 1 } flex={ 1 }>
          { /* POST USER `*/ }
          { (!props.inThread || props.feed !== 'chat') && (
            <Stack direction="row" spacing={ 1 }>
              <Box component="span" fontWeight="bold" sx={ {
                ...theme.typography.body2,
              } }>
                { item.account === '0x9d4150274f0a67985a53513767ebf5988cef45a4' ? 'eden' : 'not eden' }
              </Box>
              <Box component="span" color="rgba(255, 255, 255, 0.4)" sx={ {
                ...theme.typography.body2,
              } }>
                { item.account }
              </Box>
              <Box display="flex" flexDirection="row" alignItems="center">
                <Box
                  sx={ {
                    width        : theme.spacing(.5),
                    height       : theme.spacing(.5),
                    background   : `rgba(255, 255, 255, 0.4)`,
                    borderRadius : theme.spacing(1),
                  } }
                  comonent="span"
                />
              </Box>
              <Box component="span" color="rgba(255, 255, 255, 0.4)" sx={ {
                ...theme.typography.body2,
              } }>
                { moment(item.createdAt).fromNow() }
              </Box>
            </Stack>
          ) }
          { /* / POST USER */ }
          
          { /* POST BODY */ }
          { !!item.content && (
            <Box
              sx={ {
                '& > p' : {
                  ...theme.typography.body1,
                  my : 0,
                },
              } }
            >
              <ReactMarkdown>
                { item.content }
              </ReactMarkdown>
            </Box>
          ) }
          { /* / POST BODY */ }

          { /* EMBED */ }
          { !!getEmbeds().length && (
            <ScrollBar>
              <Stack direction={ props.feed === 'chat' ? 'column' : 'row' } spacing={ 1 } sx={ {
                mt : props.feed === 'chat' ? 1 : 0,
              } }>
                { getEmbeds().map((embed, i) => {
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
          ) }
          { /* / EMBED */ }

          { /* POST SHARE LINE */ }
          { ((props.feed === 'chat' && !item.count?.thread) || props.noShare) ? null : (
            <Box pt={ 0 }>
              <Stack
                spacing={ 2 }
                direction="row"
                alignItems="center"
                justifyContent="space-between"

                sx={ {
                  mt    : 0,
                  color : theme.palette.mode === 'dark' ? 'grey.700' : 'grey.800',
                } }
              >
                <Stack direction="row" spacing={ 1 } sx={ {
                  flex : 1,
                } }>
                  { !!item.context?.id && (
                    <Chip size="small" onClick={ () => props.history.push(`/c/${item.context.id}`) } icon={ (
                      <Tag />
                    ) } label={ item.context.name } />
                  ) }
                </Stack>

                <Stack direction="row" spacing={ 1 } sx={ {

                  '& .MuiChip-root' : {
                    background : 'transparent',
                  }
                } }>
                  <Chip size="small" icon={ (
                    <Forum />
                  ) } label={ item.count?.replies || undefined } onClick={ () => props.history.push(`/p/${item.id}`) } />
                  <Chip size="small" icon={ (
                    <Share />
                  ) } />
                </Stack>
              </Stack>
            </Box>
          ) }
          { /* / POST SHARE LINE */ }
        </Stack>
      </Stack>
    </Box>
  );
};

// export default
export default NFTPost;