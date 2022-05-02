
// import logic
import React, { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import SimpleBar from 'simplebar-react';

// import css
import 'simplebar/dist/simplebar.min.css';

// nft scrollbar
const NFTScrollBar = (props = {}) => {
  // refs
  const scrollRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  // on scroll
  const onScroll = (e) => {
    // near
    const offset = props.offset || 50;

    // actual height
    const actualHeight = (scrollRef.current.scrollHeight - scrollRef.current.clientHeight);

    // top
    const isAtTop = parseInt(scrollRef.current.scrollTop) === 0;
    const isNearTop = (scrollRef.current.scrollTop - offset) < 0;
    const isAboveTop = scrollRef.current.scrollTop > 0;

    // bottom
    const isAtBottom = parseInt(scrollRef.current.scrollTop) === parseInt(actualHeight);
    const isNearBottom = (scrollRef.current.scrollTop + offset) >= actualHeight;
    const isAboveBottom = scrollRef.current.scrollTop < actualHeight;

    // check hit bottom
    if (props.keepBottom) {
      // scrolled
      setScrolled(isAboveBottom);
      
      // if bottom
      if (props.onEnd && isAtTop) props.onEnd();
      if (props.onNearEnd && isNearTop) props.onNearEnd();
    } else {
      // scrolled
      setScrolled(isAboveTop);
      
      // if bottom
      if (props.onEnd && isAtBottom) props.onEnd();
      if (props.onNearEnd && isNearBottom) props.onNearEnd();
    }
  };

  // use effect
  useEffect(() => {
    // check scroll
    if (!props.keepBottom) return;
    if (!scrollRef.current) return;

    // check something updated
    if (!scrolled) {
      // scroll to bottom
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [props.updated, scrollRef.current]);

  // use effect
  useEffect(() => {
    // check current
    if (!scrollRef.current) return;

    // add listener
    scrollRef.current.addEventListener('scroll', onScroll);

    // remove
    return () => {
      scrollRef.current.removeEventListener('scroll', onScroll);
    };
  }, [scrollRef.current]);

  // is flex
  if (props.isFlex) {
    // return jsx
    return (
      <Box flex={ 1 } position="relative">
        <Box position="absolute" top={ 0 } left={ 0 } right={ 0 } bottom={ 0 }>
          <Box sx={ {
            flex   : 1,
            width  : '100%',
            height : '100%',

            '& .simplebar-track.simplebar-vertical .simplebar-scrollbar:before' : {
              background : `rgba(0, 0, 0, 0.5)`,
            }
          } } component={ SimpleBar } scrollableNodeProps={ {
            ref : scrollRef
          } }>
            { props.children }
          </Box>
        </Box>
      </Box>
    );
  }

  // return default scrollbar
  return (
    <Box sx={ {
      '& .simplebar-track.simplebar-vertical .simplebar-scrollbar:before' : {
        background : `rgba(0, 0, 0, 0.5)`,
      }
    } } component={ SimpleBar } scrollableNodeProps={ {
      ref : scrollRef
    } }>
      { props.children }
    </Box>
  );
};

// export default
export default NFTScrollBar;