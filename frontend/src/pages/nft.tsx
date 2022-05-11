
import React, { useEffect, useState } from 'react';
import { useBrowse, useSocket, ProfileCard } from '@nft/ui';
import { Box, Grid, Container, Typography, CircularProgress, useTheme, Stack, Tooltip } from '@mui/material';

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
    });

    // load from api
    setImages(loadedImages);
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

  // layout
  return (
    <Box flex={ 1 } display="flex" flexDirection="column">
      <Container sx={ {
        py   : 2,
        flex : 1,
      } }>
        <Grid container spacing={ 3 }>
          <Grid item xs={ 8 }>
            { (loading || loadingAccount) ? (
              <Box my={ 5 } display="flex" justifyContent="center">
                <CircularProgress />
              </Box>
            ) : (
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
                            <Grid item xs={ 2 } key={ image.id }>
                              <Tooltip title={ image.value?.name }>
                                <Box
                                  src={ `https://media.dashup.com/?width=${NFTWidth}&height=${NFTWidth}&src=${image.image?.url}` }
                                  alt={ image.value?.name }
                                  loading="lazy"
                                  component="img"

                                  sx={ {
                                    maxWidth     : '100%',
                                    borderRadius : `${theme.shape.borderRadius}px`,
                                  } }
                                />
                              </Tooltip>
                            </Grid>
                          );
                        }) }
                      </Grid>
                    </Box>
                  );
                }) }
              </Stack>
            ) }
          </Grid>

          <Grid item xs={ 4 }>
            <Box my={ 2 }>
              { !!account?.id && (
                <ProfileCard item={ account } />
              ) }
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// export default
export default NftPage;