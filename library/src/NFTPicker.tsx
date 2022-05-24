
// import react
import useSocket from './useSocket';
import ScrollBar from './ScrollBar';
import React, { useEffect, useState } from 'react';
import { Stack, Popper, Paper, Grow, Box, useTheme, CircularProgress, ClickAwayListener, Typography, Grid, InputAdornment, IconButton, FormControl, InputLabel, OutlinedInput } from '@mui/material';

// icons
import { faSearch } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// import local
import NFT from './NFT';

// image picker
const NFTPicker = (props = {}) => {
  // theme
  const theme = useTheme();
  const socket = useSocket();
  const [images, setImages] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // width
  const NFTWidth = theme.spacing(10).replace('px', '');

  // load images
  const loadImages = async () => {
    // loading
    setLoading(true);

    // images
    const loadedImages = await socket.get('/nft/list', {
      include : 'contract'
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
    return [...images].filter((image) => {
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
    if (props.open) loadImages();
  }, [props.account, props.open]);
  
  // return jsx
  return (
    <Popper
      style={ {
        zIndex : 1499,
      } }
      open={ props.open }
      anchorEl={ props.anchorEl }
      placement={ props.placement }
      transition
    >
      { ({ TransitionProps }) => (
        <Grow
          { ...TransitionProps }
          style={ {
            transformOrigin : props.placement === 'right-end' ? 'left bottom' : 'right bottom',
          } }
        >
          <Paper elevation={ 2 }>
            <ClickAwayListener onClickAway={ props.onClose }>
              <Box width={ theme.spacing(40) } height={ theme.spacing(50) } display="flex">
                { loading ? (
                  <Box flex={ 1 } display="flex" alignItems="center" justifyContent="center">
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box component={ ScrollBar } isFlex>
                    <Box p={ 2 }>
                      <Stack spacing={ 2 }>

                        <FormControl sx={ {
                          width : '100%'
                        } } variant="outlined">
                          <InputLabel htmlFor="nft-picker-search">
                            Search
                          </InputLabel>
                          <OutlinedInput
                            id="nft-picker-search"
                            type="search"
                            value={ search }
                            onChange={ (e) => setSearch(e.target.value) }
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="search"
                                >
                                  <FontAwesomeIcon icon={ faSearch } size="xs" />
                                </IconButton>
                              </InputAdornment>
                            }
                            label="Search"
                          />
                        </FormControl>

                        { getContracts().map((contract) => {
                          // return jsx
                          return (
                            <Box key={ contract.id } sx={ {

                              '& .MuiImageList-root' : {
                                overflowY : 'initial',
                              },
                              '& .MuiImageListItem-root > img' : {
                                cursor       : 'pointer',
                                borderRadius : `${theme.shape.borderRadius}px`,
                              }
                            } }>
                              <Box mb={ 1 }>
                                <Typography>
                                  { contract.name }
                                </Typography>
                              </Box>
                              <Grid container spacing={ 1 }>
                                { getImages(contract.id).map((image) => {
                                  // return image
                                  return (
                                    <Grid item xs={ 3 } key={ image.id }>
                                      <NFT
                                        item={ image }
                                        width={ NFTWidth }
                                        height={ NFTWidth }
                                        onClick={ () => props.onPick(image) }

                                        sx={ {
                                          cursor       : 'pointer',
                                          maxWidth     : '100%',
                                          borderRadius : `${theme.shape.borderRadius}px`,
                                        } }
                                      />
                                    </Grid>
                                  );
                                }) }
                              </Grid>
                            </Box>
                          );
                        }) }
                      </Stack>
                    </Box>
                  </Box>
                ) }
              </Box>
            </ClickAwayListener>
          </Paper>
        </Grow>
      ) }
    </Popper>
  )
};

// export default
export default NFTPicker;