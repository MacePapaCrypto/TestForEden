
// import react
import Play from '@mui/icons-material/PlayArrow';
import Ratio from 'react-ratio';
import dotProp from 'dot-prop';
import ReactPlayer from 'react-player';
import React, { useEffect, useRef, useState } from 'react';
import { Box, useTheme, IconButton } from '@mui/material';

// nft embed
const NFTVideoEmbed = (props = {}) => {
  // expand
  const theme = useTheme();
  const { item } = props;

  // player ref
  const playerRef = useRef(null);

  // use state
  const [played, setPlayed] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [playerUrl, setPlayerUrl] = useState(null);

  // branded colors
  const branded = {
    vimeo       : '#162221',
    reddit      : '#ff4500',
    twitch      : '#9146ff',
    youtube     : '#ff0000',
    facebook    : '#1877f2',
    soundcloud  : '#ff8800',
    dailymotion : '#00aaff',
  };

  // get brand color
  const brandColor = branded[(item.provider?.name || '').toLowerCase().trim()];

  // can play
  const getVideo = () => {
    // check react player cans
    if (ReactPlayer.canPlay(item.url)) return item.url;

    // check videos
    if (!item.videos || !item.videos[0]) return null;

    // find
    const enabled = ['video/mp4'];

    // check find
    if (item.videos.find((v) => enabled.includes(v.type))) return item.videos.map((v) => {
      // src replace
      return {
        ...v,

        src : v.url,
      };
    }).filter((v) => enabled.includes(v.type));

    // false
    return null;
  };

  // set player url
  useEffect(() => {
    // set player url
    setPlayerUrl(getVideo());
  }, [JSON.stringify(item.embeds)]);

  // use effect
  useEffect(() => {
    // can play
    if (!playerUrl || !props.visible) return;
    if (played < 2) return;

    // seek to
    playerRef.current?.seekTo(played, 'seconds');
  }, [props.visible, props.playing]);

  // return jsx
  return (
    <Box sx={ {
      width    : props.embedWidth,
      overflow : 'hidden',
      minWidth : theme.spacing(30),
      position : 'relative',
      maxWidth : (
        item.type === 'photo' ? `calc(${dotProp.get(item, 'images.0.width')}px - ${theme.spacing(4)})` : props.embedWidth
      ),
      borderRadius : `${theme.shape.borderRadius}px`,
    } }>
      { !!dotProp.get(item, 'images.0.url') && (
        <Ratio ratio={ (dotProp.get(item, 'videos.0.width') || dotProp.get(item, 'images.0.width') || 16) / (dotProp.get(item, 'videos.0.height') || dotProp.get(item, 'images.0.height') || 9) }>
          <Box position="relative" width="100%" height="100%">
            <Box
              sx={ {
                left     : 0,
                right    : 0,
                width    : '100%',
                height   : '100%',
                position : 'absolute',
              } }
              alt={ item.description || item.title }
              src={ `https://media.dashup.com/?src=${dotProp.get(item, 'images.0.url')}` }
              component="img"
            />

            { expanded ? (
              playerUrl && props.visible ? (
                <Box
                  ref={ playerRef }

                  controls

                  sx={ {
                    zIndex       : 1,
                    width        : '100%!important',
                    height       : '100%!important',
                    overflow     : 'hidden',
                    position     : 'relative',
                    borderRadius : `${theme.shape.borderRadius}px`,

                    '&.video-player > div' : { 
                      backgroundColor : `transparent!important`,
                    },
                  } }
                  config={ {
                    youtube : {
                      playerVars : {
                        showinfo : 0,
                      },
                    },
                  } }

                  url={ playerUrl }
                  onPlay={ () => props.visible && props.setPlaying(props.post?.id, props.index) }
                  onPause={ () => props.visible && props.setPlaying(false) }
                  playing={ !!props.playing }
                  component={ ReactPlayer }
                  onProgress={ ({ playedSeconds }) => setPlayed(playedSeconds) }
                />
              ) : (
                <Box
                  sx={ {
                    width        : '100%',
                    height       : '100%',
                    border       : 0,
                    zIndex       : 1,
                    position     : 'relative',
                    borderRadius : `${theme.shape.borderRadius}px`,
                  } }
                  src={ dotProp.get(item, 'videos.0.url') }
                  title={ item.title }
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  component="iframe"
                  frameborder="0"
                  allowfullscreen
                />
              )
            ) : (
              <Box sx={ {
                width    : '100%',
                height   : '100%',
                position : 'relative',
              } }>
                { !!dotProp.get(item, 'videos.0.url') && (
                  <Box position="absolute" left={ 0 } top={ 0 } height="100%" width="100%" display="flex" alignItems="center" justifyContent="center" onClick={ () => !setExpanded(true) && props.setPlaying(props.post?.id, props.index) }>
                    <IconButton sx={ {
                      background : `rgba(0, 0, 0, 0.8)`,

                      '&:hover' : {
                        background : `rgba(0, 0, 0, 0.6)`,
                      }
                    } }>
                      <Play />
                    </IconButton>
                  </Box>
                ) }
              </Box>
            ) }
          </Box>
        </Ratio>
      ) }
    </Box>
  )
};

// nft embed
export default NFTVideoEmbed;