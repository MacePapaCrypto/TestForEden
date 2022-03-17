
// import react
import {
  Box,
  Alert,
  Paper,
  Button,
} from '@mui/material';
import {
  Mainnet,
  useEthers,
  DAppProvider,
} from '@usedapp/core';
import React from 'react';

// config
const config = {
  readOnlyChainId : Mainnet.chainId,
  readOnlyUrls    : {
    [Mainnet.chainId] : 'https://mainnet.infura.io/v3/62687d1a985d4508b2b7a24827551934',
  },
}

/**
 * NFT Wrapper
 * 
 * @param props 
 * @returns 
 */
const NFTWrap = (props = {}) => {

  // return jsx
  return (
    <DAppProvider config={ config }>
      <NFTAuth { ...props } />
    </DAppProvider>
  );
};

/**
 * create nft login class
 *
 * @param props 
 */
const NFTAuth = (props = {}) => {
  // use ethers
  const { activateBrowserWallet, account } = useEthers();

  // return jsx
  return (
    <Box component={ props.component || Paper } p={ props.p || 2 } elevation={ props.elevation || 1 } sx={ props.sx || {} }>
      { window?.ethereum ? (
        account ? props.children : (
          <Box { ...(props.InnerBox || {}) }>
            <Button color="primary" onClick={ () => activateBrowserWallet() }>
              Connect
            </Button>
          </Box>
        )
      ) : (
        <Alert severity="error">
          You'll need to get MetaMask for this app to work.
        </Alert>
      ) }
    </Box>
  );
}

// export default
export default NFTWrap;