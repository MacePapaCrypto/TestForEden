import React, { useState } from 'react';
import Measure from 'react-measure';
import Carousel from 'react-material-ui-carousel';
import { Card, Stack, Box, CardContent, Avatar, Typography, useTheme, AvatarGroup } from '@mui/material';

// local
import Link from '../Link';
import useNFTs from '../useNFTs';
import NFTImage from './Image';

// font awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/pro-regular-svg-icons';

/**
 * NFT Contract
 * @returns 
 */
const MoonNFTContract = (props = {}) => {
  // nft
  const nft = useNFTs({
    limit    : 8,
    contract : props.item?.id || props.item,
  });
  const theme = useTheme();

  // state
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  
  // avatar width
  const avatarWidth = props.feed === 'chat' ? 40 : 50;
  
  // return jsx
  return (
    <Card>
      { !!nft.nfts?.length && (
        <Box px={ 2 } pt={ 2 } sx={ {
          '& .MuiIconButton-root' : {
            width   : '40px',
            height  : '40px',
            opacity : 0.5,
          }
        } }>
          <Carousel
            index={ index }
            height={ width }
            autoPlay={ false }
            onChange={ (newIndex) => setIndex(newIndex) }
            PrevIcon={ <FontAwesomeIcon icon={ faChevronLeft } size="xs" /> }
            NextIcon={ <FontAwesomeIcon icon={ faChevronRight } size="xs" /> }
            animation="fade"
            indicatorContainerProps={ {
              sx : {
                left     : 0,
                right    : 0,
                zIndex   : 1,
                bottom   : 0,
                position : 'absolute',
              }
            } }
            navButtonsAlwaysVisible
          >
            { nft.nfts.map((nft) => {
              // return jsx
              return (
                <Box key={ nft.id }>
                  <Measure
                    bounds
                    onResize={ (contentRect) => {
                      // set width
                      setWidth(parseInt(contentRect.bounds.width));
                    } }
                  >
                    { ({ measureRef }) => (
                      <Box ref={ measureRef } height={ width }>
                        { !!width && (
                          <NFTImage
                            item={ nft }
                            width={ width }
                            height={ width }
                            variant="rounded"
                          />
                        ) }
                      </Box>
                    ) }
                  </Measure>
                </Box>
              )
            }) }
          </Carousel>
        </Box>
      ) }
      <CardContent>
        <Stack width="100%" direction="row" spacing={ 2 }>
          <Stack>
            <Box component="span" sx={ {
              ...(props.feed === 'chat' ? theme.typography.body2 : theme.typography.body1),

              color      : theme.palette.text.primary,
              fontWeight : theme.typography.fontWeightMedium,
            } }>
              { props.item?.name }
            </Box>
            <Box component={ Link } target="_BLANK" to={ `/c/${props.item?.address}` } color="rgba(255, 255, 255, 0.4)" sx={ {
              ...theme.typography.body2,

              textDecoration : 'none',
            } }>
              { props.item?.address?.substring(0, 8) }
            </Box>
          </Stack>
          <Box ml="auto!important">
            <AvatarGroup max={ 3 }>
              <Avatar aria-label="recipe">
                R
              </Avatar>
              <Avatar aria-label="recipe">
                R
              </Avatar>
              <Avatar aria-label="recipe">
                R
              </Avatar>
              <Avatar aria-label="recipe">
                R
              </Avatar>
              <Avatar aria-label="recipe">
                R
              </Avatar>
            </AvatarGroup>
          </Box>
        </Stack>
        { !!props.item?.description && (
          <Typography variant="body2" color="text.secondary">
            { props.item?.description }
          </Typography>
        ) }
      </CardContent>
    </Card>
  );
};

// export default
export default MoonNFTContract;