
// import socket context
import BrowseContext from './BrowseContext';
import React, { useContext } from 'react';

// use socket hook
const useBrowse = () => {
  // use context
  const browse = useContext(BrowseContext);

  // return socket
  return browse;
};

// export default
export default useBrowse;