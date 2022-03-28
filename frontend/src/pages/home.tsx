
import React from 'react';
import Ratio from 'react-ratio';
import { Post } from '@nft/ui';
import { Box, Stack, ImageList, ImageListItem, useTheme } from '@mui/material';

/**
 * home page
 *
 * @param props 
 */
const HomePage = (props = {}) => {
  // theme
  const theme = useTheme();

  // youtube embed
  const YoutubeEmbed = (
    <Ratio ratio={ 16 / 9 }>
      <Box
        sx={ {
          width        : '100%',
          border       : 0,
          height       : '100%',
          borderRadius : theme.spacing(.5),
        } }
        src="https://www.youtube.com/embed/ZYSoE18Ue2k"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        component="iframe"
        frameborder="0"
        allowfullscreen
      />
    </Ratio>
  );

  // single image embed
  const ImagesEmbed = (
    <Ratio ratio={ 3 / 1 }>
      <Stack direction="row" spacing={ 1 } sx={ {
        height   : '100%',
        overflow : 'hidden',
      } }>
        { ['https://images.unsplash.com/photo-1589118949245-7d38baf380d6', 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6', 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6'].map((src, i) => (
          <Box
            sx={ {
              height       : '100%',
              border       : 0,
              borderRadius : theme.spacing(.5),
            } }
            key={ `img-${i}` }
            src={ src }
            loading="lazy"
            component="img"
          />
        ))}
      </Stack>
    </Ratio>
  );

  // single image embed
  const ImageEmbed = (
    <Box
      sx={ {
        width        : '100%',
        height       : 'auto',
        borderRadius : theme.spacing(.5),
      } }
      src="https://images.unsplash.com/photo-1589118949245-7d38baf380d6"
      component="img"
    />
  );

  // single image embed
  const TwoImageEmbed = (
    <Ratio ratio={ 3 / 1 }>
      <Stack spacing={ 2 } direction="row" sx={ {
        height : '100%',
      } }>
        <Box flex={ 1 } sx={ {
          height             : '100%',
          borderRadius       : theme.spacing(.5),
          backgroundSize     : 'cover',
          backgroundImage    : 'url(https://images.unsplash.com/photo-1589118949245-7d38baf380d6)',
          backgroundPosition : 'center',
        } } />
        <Box flex={ 1 } sx={ {
          height             : '100%',
          borderRadius       : theme.spacing(.5),
          backgroundSize     : 'cover',
          backgroundImage    : 'url(https://images.unsplash.com/photo-1589118949245-7d38baf380d6)',
          backgroundPosition : 'center',
        } } />
      </Stack>
    </Ratio>
  );

  // return jsx
  return (
    <Stack spacing={ 2 }>
      <Post embed={ YoutubeEmbed } body="Video Embed" />
      <Post embed={ ImagesEmbed } body="More than 2 Images Embed" />
      <Post embed={ ImageEmbed } body="Single Image Embed" />
      <Post embed={ TwoImageEmbed } body="Two Image Embed" />
      <Post />
    </Stack>
  );
};

// export default
export default HomePage;