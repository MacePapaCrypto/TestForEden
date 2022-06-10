
import React, { useEffect, useState } from 'react';
import { NFTImage, useBrowse, useSocket, ProfileCard } from '@nft/ui';
import { Box, Grid, Container, Typography, CircularProgress, useTheme, Stack } from '@mui/material';

/**
 * home page
 *
 * @param props 
 */
const NftPage = (props = {}) => {
  // theme
  const { account, loadingAccount } = useBrowse();

  // theme
  const theme = useTheme();
  const socket = useSocket();
  const [images, setImages] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // width
  const NFTWidth = theme.spacing(20).replace('px', '');

  // load images
  const loadImages = async () => {
    // loading
    setLoading(true);

    // images
    const loadedImages = await socket.get('/nft/list', {
      account : account?.id,
      include : 'contract',
    });

    // load from api
    setImages(loadedImages.data);
    setLoading(false);
  };

  // get searched
  const getSearched = () => {
    // check search
    if (!search || !search.trim().length) return images;

    // get tags
    const tags = search.split(' ').map((t) => t.length ? t.toLowerCase() : null).filter((t) => t);

    // filter by tags
    return images.filter((image) => {
      // find in images
      return !tags.find((t) => {
        // doesn't include a tag
        return !(`${image.value?.name || image.name} ${image.contract?.id} ${image.id} ${image.contract?.name}`.toLowerCase().includes(t));
      });
    });
  };

  // get contracts
  const getContracts = () => {
    // return from images
    return getSearched().reduce((accum, image) => {
      // find contract
      if (accum.find((c) => c.id === image.contract?.id)) return accum;

      // push image contract
      accum.push(image.contract);
      
      // return accum
      return accum;
    }, []);
  };

  // get images
  const getImages = (contract) => {
    // filtered images
    return getSearched().filter((image) => image.contract?.id === contract);
  };

  // use effect
  useEffect(() => {
    // load images
    loadImages();
  }, [account?.id]);

  // loading
  if (loading) return (
    <Box display="flex" alignItems="center" justifyContent="center" py={ 5 } flex={ 1 }>
      <CircularProgress />
    </Box>
  );

  // layout
  return (
    <Stack spacing={ 2 }>
      { getContracts().map((contract) => {
        // return jsx
        return (
          <Box key={ contract.id }>
            <Box mb={ 1 }>
              <Typography>
                { contract.name }
              </Typography>
            </Box>
            <Grid container spacing={ 2 }>
              { getImages(contract.id).map((image) => {
                // return image
                return (
                  <Grid item xs={ 2 } key={ `${contract.id}:${image.id}` }>
                    <NFTImage width={ NFTWidth } height={ NFTWidth } item={ image } sx={ {
                      maxWidth     : '100%',
                      borderRadius : `${theme.shape.borderRadius}px`,
                    } } />
                  </Grid>
                );
              }) }
            </Grid>
          </Box>
        );
      }) }
    </Stack>
  );
};

// export default
export default NftPage;