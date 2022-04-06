
import React from 'react';
import Ratio from 'react-ratio';
import { Box as NFTBox, Post, Layout, LayoutItem } from '@nft/ui';
import { Box, Grid, Typography, Stack, useTheme } from '@mui/material';

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

  // layout
  const layout = [
    { i: "a", x: 0, y: 0, w: 1, h: 2 },
    { i: "b", x: 1, y: 0, w: 3, h: 2 },
    { i: "c", x: 4, y: 0, w: 1, h: 2 }
  ];

  // layout
  return (
    <Box flex={ 1 } display="flex">
      <Layout layout={ layout }>
        <div key="a" data-grid={ { maxW : 3 } }>
          <LayoutItem>
            <NFTBox sx={ {
              flex : 1,
            } } />
          </LayoutItem>
        </div>
        <div key="b">
          <LayoutItem isScrollable>
            <Stack spacing={ 2 }>
              <Post embed={ YoutubeEmbed } body="Video Embed" />
              <Post embed={ ImagesEmbed } body="More than 2 Images Embed" />
              <Post embed={ ImageEmbed } body="Single Image Embed" />
              <Post embed={ TwoImageEmbed } body="Two Image Embed" />
              <Post />
            </Stack>
          </LayoutItem>
        </div>
        <div key="c">
          <LayoutItem>
            <NFTBox sx={ {
              flex : 1,
            } } />
          </LayoutItem>
        </div>
      </Layout>
    </Box>
  );

  // return jsx
  return (
    <Grid container spacing={ 2 }>
      <Grid item xs={ 3 }>
        <Box py={ 2 }>
          <Typography variant="body2">
            LEFT
          </Typography>
        </Box>
      </Grid>
      <Grid item flex={ 1 }>
      </Grid>
      <Grid item xs={ 3 }>
        <Box py={ 2 }>
          <Typography variant="body2">
            RIGHT
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

// export default
export default HomePage;