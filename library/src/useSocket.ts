
// import socket context
import SocketContext from './SocketContext';
import React, { useContext } from 'react';

// use socket hook
const useSocket = () => {
  // use context
  const socket = useContext(SocketContext);

  // return socket
  return socket;
};

// export default
export default useSocket;