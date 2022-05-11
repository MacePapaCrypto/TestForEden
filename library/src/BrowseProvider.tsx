
// socketio client
import usePost from './usePost';
import useSocket from './useSocket';
import useSegments from './useSegments';
import useContexts from './useContexts';
import BrowseContext from './BrowseContext';
import React, { useEffect, useState } from 'react';


// socket context
const BrowseProvider = (props = {}) => {
  // segment
  const post = usePost(props.post);
  const socket = useSocket();
  const segments = useSegments();
  const contexts = useContexts();

  // state
  const [segment, setActualSegment] = useState(typeof props.segment !== 'string' ? props.segment : null);
  const [context, setActualContext] = useState(typeof props.context !== 'string' ? props.context : null);
  const [account, setActualAccount] = useState(typeof props.account !== 'string' ? props.account : null);
  const [loadingSegment, setLoadingSegment] = useState(false);
  const [loadingContext, setLoadingContext] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);

  // load middlewares
  const setSegment = (newSegment) => {
    // set segment
    setActualSegment(typeof newSegment !== 'string' ? newSegment : null);

    // check segment
    if (newSegment && context && context.segment !== newSegment.id) {
      // load segment
      loadContext();
    }
  };

  // load middlewares
  const setContext = (newContext) => {
    // set segment
    setActualContext(typeof newContext !== 'string' ? newContext : null);

    // check segment
    if (newContext?.segment && segment?.id !== newContext.segment) {
      // load segment
      loadSegment(newContext.segment);
    }

    // check segment
    if (newContext?.account && account?.id !== newContext.account) {
      // load segment
      loadSegment(newContext.account);
    }
  };

  // load middlewares
  const setAccount = (newAccount) => {
    // set segment
    setActualAccount(typeof newAccount !== 'string' ? newAccount : null);
  };

  // load segment
  const loadSegment = async (id = null) => {
    // check id
    if (!id) id = props.segment || context?.segment || post.post?.segment;

    // check segment already set correctly
    if ((typeof id === 'string' && (id === segment?.id)) || (id?.id && (id.id === segment?.id))) return;

    // check missing
    if (!id && (props.context || props.post)) return;
  
    // found segment
    let foundSegment;
    
    // check segment
    if (typeof id === 'string') {
      // set loading
      setLoadingSegment(true);

      // get segment
      foundSegment = await segments.get(id);
    } else if (typeof id !== 'string') {
      foundSegment = id;
    }

    // set segment
    setLoadingSegment(false);
    setSegment(foundSegment);
  };

  // load context
  const loadContext = async (id = null) => {
    // check id
    if (!id) id = props.context || post.post?.context;
    
    // check context already set correctly
    if ((typeof id === 'string' && (id === context?.id)) || (id?.id && (id.id === context?.id))) return;

    // check missing
    if (!id && props.post) return;

    // found context
    let foundContext;
    
    // check context
    if (typeof id === 'string') {
      // set loading
      setLoadingContext(true);

      // get context
      foundContext = await contexts.get(id);
    } else if (typeof id === 'object') {
      foundContext = id;
    }

    // set context
    setLoadingContext(false);
    setContext(foundContext);
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
    // load segment
    loadSegment();
  }, [props.segment, post.post?.segment]);

  // use effect
  useEffect(() => {
    // load segment
    loadContext();
  }, [props.context, post.post?.context]);

  // use effect
  useEffect(() => {
    // load segment
    loadAccount();
  }, [props.account]);
  
  // return placement
  const fauxBrowse = {
    post,
    segment,
    context,
    account,

    loading : loadingContext ? 'context' : (loadingSegment ? 'segment' : (loadingAccount ? 'account' : false)),
    loadingContext,
    loadingSegment,
    loadingAccount,

    providedSegment : props.segment,
    providedContext : props.context,
    providedAccount : props.account,

    setSegment,
    setContext,

    loadContext,
    loadSegment,
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