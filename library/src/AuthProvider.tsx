
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
  const [updated, setUpdated] = useState(new Date());
  const [loading, setLoading] = useState(!!initialAccount);

  // emit user
  const emitUser = (user) => {
    // check user
    if (user.id === authed.id) {
      // update
      Object.keys(user).forEach((key) => {
        authed[key] = user[key];
      });

      // update
      setUpdated(new Date());
    }
  };

  // create account context
  const auth = {
    authed,
    enabled : !!window?.ethereum,
    account : authed && account,
    loading : loading,

    login  : activateBrowserWallet,
    logout : deactivate,
    
    emitUser,
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
      setAuthed(null);
      setLoading(true);

      // auth backend
      const authReq = await socket.get(`/auth/${account}`);

      // check authenticated
      if (`${account}`.toLowerCase() === `${authReq.account}`.toLowerCase()) {
        // set authed
        setAuthed(authReq);
        setLoading(false);

        // return
        return;
      }

      // sign challenge
      const [message, signature] = await signChallenge(authReq.nonce);

      // auth
      const result = await socket.post(`/auth/${account}`, {
        message,
        signature,
      });

      // set loading
      if (result) {
        // authed
        setAuthed(result);
      
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

  // once authed
  useEffect(() => {
    // check account
    if (!account) return;

    // auth backend on restart
    socket.socket.on('user', emitUser);
    socket.socket.on('connect', authBackend);

    // return done
    return () => {
      // off
      socket.socket.removeListener('user', emitUser);
      socket.socket.removeListener('connect', authBackend);
    };
  }, [authed]);

  // to window
  window.NFTAuth = auth;

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