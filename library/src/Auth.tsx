
// import react
import {
  Box,
  Alert,
  Paper,
  Button,
  Divider,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

/**
 * create nft login class
 *
 * @param props 
 */
const NFTAuth = (props = {}) => {
  // state
  const [account, setAccount] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [connecting, setConnecting] = useState(true);

  // on connect
  const onConnect = async () => {
    // check ethereum
    if (!window?.ethereum) return;

    // connecting
    setConnecting(true);

    // load accounts
    const loadedAccounts = await window.ethereum.request({
      method : 'eth_requestAccounts',
    });

    // add accounts
    setAccounts(loadedAccounts);

    // set address
    if (loadedAccounts.length === 1) setAccount(loadedAccounts[0]);

    // set connecting
    setConnecting(false);
  };

  // check connected
  useEffect(() => {
    // check ethereum
    if (!window?.ethereum) return;

    // check existing account
    window.ethereum.request({
      method : 'eth_accounts',
    }).then((accounts) => {
      // check accounts
      if (accounts?.length) {
        // set accounts
        setAccounts(accounts);
      }
  
      // reset
      setConnecting(false);
    });
  }, []);

  // return jsx
  return (
    <Box component={ props.component || Paper } p={ props.p || 2 } elevation={ props.elevation || 1 } sx={ props.sx || {} }>
      { window?.ethereum ? (
        account ? props.children : (
          <Box { ...(props.InnerBox || {}) }>

            { accounts.map((available) => {
              // return jsx
              return (
                <Box onClick={ () => setAccount(available) }>
                  { JSON.stringify(available) }
                </Box>
              );
            }) }

            { !!accounts.length && (
              <Box my={ 1 }>
                <Divider />
              </Box>
            ) }

            <Button color="primary" onClick={ () => onConnect() }>
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
export default NFTAuth;