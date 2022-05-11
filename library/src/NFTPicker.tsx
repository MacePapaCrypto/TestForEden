
// import react
import useSocket from './useSocket';
import ScrollBar from './ScrollBar';
import React, { useEffect, useState } from 'react';
import { Stack, Popover, Box, useTheme, CircularProgress, Tooltip, Typography, ImageList, ImageListItem, InputAdornment, IconButton, FormControl, InputLabel, OutlinedInput } from '@mui/material';

// icons
import { faSearch } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
    // images
    const loadedImages = await socket.get('/nft/list');

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
  }, [props.account]);
  
  // return jsx
  return (
    <Popover
      { ...props }
    >
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
                      <Box>
                        <Typography>
                          { contract.name }
                        </Typography>
                      </Box>
                      <ImageList cols={ 3 } rowHeight={ NFTWidth }>
                        { getImages(contract.id).map((image) => {
                          // return image
                          return (
                            <ImageListItem key={ image.id }>
                              <Tooltip title={ image.value?.name }>
                                <Box
                                  src={ `https://media.dashup.com/?width=${NFTWidth}&height=${NFTWidth}&src=${image.image?.url}` }
                                  alt={ image.value?.name }
                                  onClick={ () => props.onPick(image) }
                                  loading="lazy"
                                  component="img"
                                />
                              </Tooltip>
                            </ImageListItem>
                          );
                        }) }
                      </ImageList>
                    </Box>
                  );
                }) }
              </Stack>
            </Box>
          </Box>
        ) }
      </Box>
    </Popover>
  )
};

// export default
export default NFTPicker;