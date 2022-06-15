
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
const MoonAuthProvider = (props = {}) => {
  // highest order
  const { library, activateBrowserWallet, deactivate, account } = useEthers();

  // session id
  const initialAccount = localStorage?.getItem('acid');

  // use ethers
  const socket = useSocket();
  const [user, setUser] = useState(false);
  const [updated, setUpdated] = useState(new Date());
  const [loading, setLoading] = useState(!!initialAccount);

  // emit user
  const emitUser = (user) => {
    // check user
    if (user.id === user.id) {
      // update
      Object.keys(user).forEach((key) => {
        user[key] = user[key];
      });

      // update
      setUpdated(new Date());
    }
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
      setUser(null);
      setLoading(true);

      // auth backend
      const authReq = await socket.get(`/auth/${account}`);

      // check authenticated
      if (`${account}`.toLowerCase() === `${authReq.id}`.toLowerCase()) {
        // set user
        setUser(authReq);
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
        // user
        setUser(result);
      
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
    if (user) return;
    if (!account) return;

    // authenticate account
    authBackend();
  }, [account]);

  // once user
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
  }, [user]);

  // create account context
  const auth = {
    user,
    enabled : !!window?.ethereum,
    account : user && account,
    loading : loading,

    login  : activateBrowserWallet,
    logout : deactivate,
    
    emitUser,
  };

  // to window
  window.MoonAuth = auth;

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
const MoonAuthWrap = (props = {}) => {

  // return jsx
  return (
    <DAppProvider config={ config }>
      <MoonAuthProvider { ...props } />
    </DAppProvider>
  );
};

// export default
export default MoonAuthWrap;