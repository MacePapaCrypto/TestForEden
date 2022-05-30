
// import react
import React from 'react';
import dotProp from 'dot-prop';
import { useHistory } from 'react-router-dom';
import { Box, Card, CardMedia, CardContent, Button, Typography, useTheme } from '@mui/material';

// nft embed
const NFTContractEmbed = (props = {}) => {
  // expand
  const theme = useTheme();
  const history = useHistory();

  // itme
  const { item } = props;

  // branded colors
  const branded = {
    paintswap : 'rgb(125, 143, 209)',
  };

  // get brand color
  const brandColor = branded[(item.provider || '').toLowerCase().trim()];

  return (
    <Card sx={ {
      width    : props.embedWidth,
      display  : 'flex',
      minWidth : theme.spacing(30),
      position : 'relative',
      maxWidth : props.embedWidth,
    } }>
      { !!dotProp.get(item, 'images.poster.url') && (
        <CardMedia
          sx={ {
            maxWidth  : '40%',
            maxHeight : theme.spacing(30),
          } }
          alt="Live from space album cover"
          image={ `https://media.dashup.com/?height=${theme.spacing(30).replace('px', '')}&src=${dotProp.get(item, 'images.poster.url')}` }
          component="img"
        />
      ) }
      <Box sx={ {
        display       : 'flex',
        flexDirection : 'column',
      } }>
        <CardContent sx={ {
          flex       : 1,
          display    : 'flex',
          alignItems : 'center',
        } }>
          <Box>
            <Typography component="div" variant="body1" sx={ {
              display         : '-webkit-box',
              overflow        : 'hidden',
              WebkitBoxOrient : 'vertical',
              WebkitLineClamp : 1,
            } }>
              { `${item.name}` }
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div">
              { item.provider }
            </Typography>
            <Typography variant="body2" component="div" sx={ {
              mt              : 1,
              display         : '-webkit-box',
              overflow        : 'hidden',
              WebkitBoxOrient : 'vertical',
              WebkitLineClamp : 3,
            } }>
              { item.description }
            </Typography>
          </Box>
        </CardContent>
        <CardContent>
          <Button variant="text" onClick={ () => history.push(`/c/${item.address}`) }>
            Explore Collection
          </Button>
        </CardContent>
        <Box />
      </Box>
    </Card>
  );
};

// nft embed
export default NFTContractEmbed;