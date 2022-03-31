
// socketio client
import socketio from 'socket.io-client';
import { v1 as uuid } from 'uuid';
import React, { useEffect, useState } from 'react';

// socket context
import SocketContext from './SocketContext';

// socket context
const SocketProvider = (props = {}) => {
  // create socket
  const [url, setUrl] = useState(props.url);
  const [socket, setSocket] = useState(url && socketio.connect(url, {
    path : '/nft/'
  }));

  // use effect
  useEffect(() => {
    // check url
    if (url === props.url) return;

    // set url
    setUrl(props.url);
    setSocket(props.url && socketio.connect(props.url, {
      path : '/nft/'
    }));
  }, [url]);

  // add call function
  socket.call = (method, path, data) => {
    // get id
    const id = uuid();

    // create promise
    const result = new Promise((resolve, reject) => {
      // resolve
      socket.once(id, ({ success, result, message }) => {
        // check result
        if (success) return resolve(result);

        // reject
        reject(message);
      });
    });

    // emit
    socket.emit('call', id, method, path, data);

    // return result
    return result;
  };

  // methods
  socket.get = (path, data) => socket.call('GET', path, data);
  socket.put = (path, data) => socket.call('PUT', path, data);
  socket.post = (path, data) => socket.call('POST', path, data);
  socket.patch = (path, data) => socket.call('PATCH', path, data);
  socket.delete = (path, data) => socket.call('DELETE', path, data);

  // to window
  window.NFTSocket = socket;

  // return jsx
  return (
    <SocketContext.Provider value={ socket }>
      { props.children }
    </SocketContext.Provider>
  );
};

// export default
export default SocketProvider;