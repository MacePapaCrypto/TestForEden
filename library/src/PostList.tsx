
import Post from './Post';
import dotProp from 'dot-prop';
import React, { useState } from 'react';
import { Box, Divider, Stack } from '@mui/material';

/**
 * NFT Feed
 *
 * @param props 
 */
const NFTPostList = (props = {}) => {

  // use state
  let [visible, setVisible] = useState([]);
  const [playing, setPlaying] = useState(null);
  const [userPlaying, setUserPlaying] = useState(false);

  // faux
  const setRealPlaying = (val) => {
    // set playing
    setPlaying(val);

    // check value
    if (val && props.feed === 'feed') {
      setUserPlaying(true);
    } else if (playing && (playing.id === (visible[0] || {}).item?.id)) {
      setUserPlaying(false);
    }
  };

  // update visible
  const updateVisible = (ref, item, isVisible = false) => {
    // let
    let updatedPosts = visible;

    // remove from visible
    if (!isVisible) {
      // updated
      updatedPosts = [...visible].filter((v) => v.item.id !== item.id);
    } else {
      // updated
      updatedPosts = [...visible, { item, ref }];
    }

    // set visible
    visible = updatedPosts;
    setVisible(updatedPosts);

    // check playing
    if (playing && (!updatedPosts[0] || !dotProp.get(updatedPosts[0].item, 'embeds.0.videos.0.url'))) {
      // set playing
      setPlaying(null);
    } else if (userPlaying && updatedPosts[0] && dotProp.get(updatedPosts[0].item, 'embeds.0.videos.0.url')) {
      // set playing
      setPlaying({
        id    : updatedPosts[0].item.id,
        index : 0,
      })
    }
  };

  // sorted posts
  const sortedPosts = props.feed === 'chat' ? [...(props.posts)].reverse() : props.posts;

  // return jsx
  return (
    <Stack
      spacing={ props.feed === 'chat' ? 0 : 2 }
      { ...props }
    >

      { sortedPosts.map((post, i) => {
        // prev
        const prev = sortedPosts[i - 1];

        // return post
        return (
          <Box key={ `post-${post.id}` }>
            <Post
              item={ post }
              feed={ props.feed }
              { ...(props.PostProps || {}) }
              
              playing={ playing }
              inThread={ prev?.account === post.account }
              onHidden={ (ref, item) => updateVisible(ref, item, false) }
              onVisible={ (ref, item) => updateVisible(ref, item, true) }
              setPlaying={ (id, index) => setRealPlaying(id ? { id, index } : null) }
              EmbedProps={ props.EmbedProps }
            />
            { props.feed !== 'chat' && (
              <Box mt={ 2 }>
                <Divider />
              </Box>
            ) }
          </Box>
        );
      }) }

    </Stack>
  );
}

// export default feed
export default NFTPostList;