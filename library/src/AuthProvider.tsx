
// import react
import {
  Mainnet,
  useEthers,
  DAppProvider,
} from '@usedapp/core';
import { SiweMessage } from 'siwe';
import { getDefaultProvider } from 'ethers';
import React, { useState, useEffect } from 'react';

// socket context
import useSocket from './useSocket';
import AuthContext from './AuthContext';

// host info
const domain = window.location.host;
const origin = window.location.origin;

// config
const config = {
  readOnlyUrls : {
    [Mainnet.chainId] : getDefaultProvider('mainnet'),
  },
  readOnlyChainId : Mainnet.chainId,
};

/**
 * nft auth provider
 *
 * @param props 
 */
const NFTAuthProvider = (props = {}) => {
  // highest order
  const { library, activateBrowserWallet, deactivate, account } = useEthers();

  // session id
  const initialAccount = localStorage?.getItem('acid');

  // use ethers
  const socket = useSocket();
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(!!initialAccount);

  // create account context
  const auth = {
    enabled : !!window?.ethereum,
    account : authed && account,
    loading : loading,

    login  : activateBrowserWallet,
    logout : deactivate,
  };

  // sign challenge
  const signChallenge = async (nonce) => {
    // get provider
    const signer = library.getSigner();

    // create message
    const message = new SiweMessage({
      nonce,
      domain,
      uri       : origin,
      chainId   : '1',
      address   : account,
      version   : '1',
      statement : 'Sign in to NFT',
    });

    // send async
    return [message, await signer.signMessage(message.prepareMessage())];
  }

  // authenticate backend
  const authBackend = async () => {
    // try/catch
    try {
      // set loading
      setLoading(true);

      // auth backend
      const {
        nonce,
        account : authedAccount,
      } = await socket.get(`/auth/${account}`);

      // check authenticated
      if (account === authedAccount) {
        // set authed
        setAuthed(true);
        setLoading(false);

        // return
        return;
      }

      // sign challenge
      const [message, signature] = await signChallenge(nonce);

      // auth
      const result = await socket.post(`/auth/${account}`, {
        message,
        signature,
      });

      // set loading
      if (result) {
        // authed
        setAuthed(true);
      
        // set item
        localStorage?.setItem('acid', account);
      }

      // loading
      setLoading(false);

      // return result
      return result;
    } catch (e) {
      // session id
      localStorage?.removeItem('acid');
      deactivate();
    }
  };

  // use effect for new account check
  useEffect(() => {
    // check account
    if (authed) return;
    if (!account) return;

    // authenticate account
    authBackend();
  }, [account]);

  // context
  return (
    <AuthContext.Provider value={ auth }>
      { props.children }
    </AuthContext.Provider>
  );
};

/**
 * NFT Wrapper
 * 
 * @param props 
 * @returns 
 */
const NFTAuthWrap = (props = {}) => {

  // return jsx
  return (
    <DAppProvider config={ config }>
      <NFTAuthProvider { ...props } />
    </DAppProvider>
  );
};

// export default
export default NFTAuthWrap;