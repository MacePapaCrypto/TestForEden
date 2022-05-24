
// socketio client
import usePost from './usePost';
import useAuth from './useAuth';
import useSocket from './useSocket';
import useSpaces from './useSpaces';
import BrowseContext from './BrowseContext';
import React, { useEffect, useState } from 'react';


// socket context
const BrowseProvider = (props = {}) => {
  // segment
  const post = usePost(props.post);
  const auth = useAuth();
  const socket = useSocket();
  const spaces = useSpaces();

  // get space
  const propsSpace = typeof props.space !== 'string' ? props.space : null;

  // in space context
  const [space, setActualSpace] = useState(propsSpace?.space ? null : propsSpace);
  const [subSpace, setActualSubSpace] = useState(propsSpace?.space ? propsSpace : null);

  // in account context
  const [account, setActualAccount] = useState(typeof props.account !== 'string' ? props.account : null);

  // loading context
  const [loadingSpace, setLoadingSpace] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);

  // load middlewares
  const setSpace = (newSpace) => {
    // check subspace
    if (newSpace?.space) {
      // set subspace
      setActualSubSpace(newSpace);
      loadSpace(newSpace?.space);
    } else {
      // set segment
      setActualSpace(typeof newSpace !== 'string' ? newSpace : null);
    }
  };

  // set subspace
  const setSubSpace = (newSpace) => {
    // set segment
    setActualSubSpace(typeof newSpace !== 'string' ? newSpace : null);

    // check parent space
    if (newSpace?.space && (newSpace?.space !== space?.id)) {
      // no space
      setActualSpace(null);
    }
  };

  // set space feed
  const setSpaceFeed = (type = 'hot') => {
    // set space
    setActualSpace({
      ...space,
      activeFeed : type,
    });
  };

  // load middlewares
  const setAccount = (newAccount) => {
    // set segment
    setActualAccount(typeof newAccount !== 'string' ? newAccount : null);
  };

  // load segment
  const loadSpace = async (id = null) => {
    // check id
    if (!id) id = props.space;

    // props space
    const propsSpace = props.space?.id || props.space;

    // check segment already set correctly
    if (typeof propsSpace === 'string' && (propsSpace === space?.id)) {
      // set sub space
      setSubSpace(null);

      // return
      return;
    }

    // check missing
    if (!id && props.post) return;
  
    // found segment
    let foundSpace;
    
    // check segment
    if (typeof id === 'string') {
      // set loading
      setLoadingSpace(true);

      // get segment
      foundSpace = await spaces.get(id);
    } else if (typeof id !== 'string') {
      foundSpace = id;
    }

    // check has parent
    if (foundSpace?.space) {
      // load space
      setSubSpace(foundSpace);
      return loadSpace(foundSpace.space);
    } else if (id === propsSpace) {
      // set sub space
      setSubSpace(null);
    }

    // set segment
    setLoadingSpace(false);
    setSpace(foundSpace);
  };

  // load context
  const loadAccount = async (id = null) => {
    // check id
    if (!id) id = props.account;
    
    // check context already set correctly
    if ((typeof id === 'string' && (id === account?.id)) || (id?.id && (id.id === account?.id))) return;

    // found context
    let foundAccount;
    
    // check context
    if (typeof id === 'string') {
      // set loading
      setLoadingAccount(true);

      // load
      foundAccount = await socket.get(`/account/${id}`);
    } else if (typeof id === 'object') {
      foundAccount = id;
    }

    // set context
    setLoadingAccount(false);
    setAccount(foundAccount);
  };

  // use effect
  useEffect(() => {
    // check loading
    if (auth.loading) return;

    // load segment
    loadSpace();
  }, [props.space, auth.loading]);

  // use effect
  useEffect(() => {
    // load segment
    loadAccount();
  }, [props.account]);

  // return placement
  const fauxBrowse = {
    post,
    space,
    account,
    subSpace,
    
    feed    : subSpace?.feed || space?.activeFeed || props.feed || 'hot',
    loading : loadingAccount ? 'account' : (loadingSpace ? 'space' : false),
    loadingSpace,
    loadingAccount,

    providedOrder : props.order,
    providedSpace : props.space,
    providedAccount : props.account,

    setFeed : setSpaceFeed,
    setSpace,
    setSubSpace,

    loadSpace,
    loadAccount,
  };

  // to window
  window.NFTBrowse = fauxBrowse;

  // return jsx
  return (
    <BrowseContext.Provider value={ fauxBrowse }>
      { props.children }
    </BrowseContext.Provider>
  );
};

// export default
export default BrowseProvider;