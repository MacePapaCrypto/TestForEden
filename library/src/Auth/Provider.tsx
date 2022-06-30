
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
import useSocket from '../useSocket';
import AuthContext from './Context';
import AuthEmitter from './Emitter';

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

  // socket
  const socket = useSocket();

  // session id
  const initialAccount = localStorage?.getItem('acid');

  // updated
  const [,setUpdated] = useState(() => {
    // return date
    return new Date();
  });

  // create emitter
  const [emitter] = useState(() => {
    // return emitter
    return window.authEmitter || new AuthEmitter({
      socket,
      account : account || initialAccount,

      login,
      logout,
      challenge,
    });
  });

  /**
   * login
   */
  const login = () => {
    // activate wallet
    activateBrowserWallet();
  };

  /**
   * logout function
   */
  const logout = () => {
    // session id
    localStorage?.removeItem('acid');
    deactivate();
  };

  /**
   * challenge function
   */
  const challenge = async (nonce) => {
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
    const signature = await signer.signMessage(message.prepareMessage());

    // return message and signature
    return {
      message,
      signature,
    };
  };

  // use effect
  useEffect(() => {
    // do props
    emitter.props({ account });
  }, [account]);

  // load account
  useEffect(() => {
    // set acid
    localStorage?.setItem('acid', emitter?.state?.account);
  }, [emitter?.state?.account]);

  // use effect
  useEffect(() => {
    // check emitter
    if (!emitter) return;

    // create listener
    const onUpdated = () => setUpdated(new Date());

    // add listener
    emitter.on('user', onUpdated);
    emitter.on('loading', onUpdated);
    emitter.on('updated', onUpdated);
    emitter.on('account', onUpdated);

    // return
    return () => {
      // return done
      emitter.removeListener('user', onUpdated);
      emitter.removeListener('loading', onUpdated);
      emitter.removeListener('updated', onUpdated);
      emitter.removeListener('account', onUpdated);
    };
  }, [emitter]);

  // to window
  window.MoonAuth = emitter?.state;

  // context
  return (
    <AuthContext.Provider value={ emitter?.state }>
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