
// import socket context
import SocketContext from './Socket/Context';
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