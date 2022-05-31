// import
import React from 'react';
import { useNFTs, NFTList } from '@nft/ui';

// home page contract
const HomePageContract = (props = {}) => {
  // nft
  const nft = useNFTs({
    contract : props.contract?.id || props.contract,
  });

  // return jsx
  return (
    <NFTList items={ nft.nfts } />
  );
};

// export default
export default HomePageContract;