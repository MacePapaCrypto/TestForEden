
// socketio client
import usePost from './usePost';
import useSegments from './useSegments';
import useContexts from './useContexts';
import BrowseContext from './BrowseContext';
import React, { useEffect, useState } from 'react';


// socket context
const BrowseProvider = (props = {}) => {
  // segment
  const post = usePost(props.post);
  const segments = useSegments();
  const contexts = useContexts();

  // state
  const [segment, setActualSegment] = useState(typeof props.segment === 'object' ? props.segment : null);
  const [context, setActualContext] = useState(typeof props.context === 'object' ? props.context : null);
  const [loadingSegment, setLoadingSegment] = useState(false);
  const [loadingContext, setLoadingContext] = useState(false);

  // load middlewares
  const setSegment = (segment) => {
    // set segment
    setActualSegment(segment);

    // check segment
    if (segment && context && context.segment !== segment.id) {
      // load segment
      loadContext();
    }
  };

  // load middlewares
  const setContext = (context) => {
    // set segment
    setActualContext(context);

    // check segment
    if (context?.segment && segment?.id !== context.segment) {
      // load segment
      loadSegment(context.segment);
    }
  };

  // load segment
  const loadSegment = async (id = props.segment) => {
    // check segment already set correctly
    if ((typeof id === 'string' && id === segment?.id) || (id?.id && id.id === segment?.id)) return;

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
    } else if (typeof id === 'object') {
      foundSegment = id;
    }

    // set segment
    setLoadingSegment(false);
    setSegment(foundSegment);
  };

  // load context
  const loadContext = async (id = props.context) => {
    // check context already set correctly
    if ((typeof id === 'string' && id === context?.id) || (id?.id && id.id === context?.id)) return;

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

  // use effect
  useEffect(() => {
    // load segment
    loadSegment();
  }, [props.segment]);

  // use effect
  useEffect(() => {
    // load segment
    loadContext();
  }, [props.context]);

  // use effect
  useEffect(() => {
    // load segment
    if (!post.post?.id) return;

    // set info
    if (post.post.context) {
      loadContext(post.post.context);
    } else if (post.post.segment) {
      loadSegment(post.post.segment);
    }
  }, [post.post?.id]);
  
  // return placement
  const fauxBrowse = {
    post,
    segment,
    context,

    loading : loadingContext ? 'context' : (loadingSegment ? 'segment' : false),
    loadingContext,
    loadingSegment,

    providedSegment : props.segment,
    providedContext : props.context,

    setSegment,
    setContext,

    loadContext,
    loadSegment,
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