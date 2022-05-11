
// socketio client
import socketio from 'socket.io-client';
import React, { useEffect, useState } from 'react';

// socket context
import useId from './useId';
import SocketContext from './SocketContext';

// calling
const callCache = {};

// socket context
const SocketProvider = (props = {}) => {
  // use id
  const nanoid = useId();

  // session id
  const ssid = localStorage?.getItem('ssid') || `${nanoid()}`;

  // set item
  localStorage?.setItem('ssid', ssid);
  
  // socket opts
  const socketOpts = {
    path  : '/nft',
    query : {
      ssid,
    },
    reconnect  : true,
    transports : ['websocket'],
  };

  // create socket
  const [url, setUrl] = useState(props.url);
  const [socket, setSocket] = useState(url && socketio.connect(url, socketOpts));

  // use effect
  useEffect(() => {
    // check url
    if (url === props.url) return;

    // set url
    setUrl(props.url);
    setSocket(props.url && socketio.connect(props.url, socketOpts));
  }, [url]);

  // add call function
  socket.call = (method, path, data = {}, cache = true) => {
    // check cache
    if (cache && callCache[`${method}${path}${JSON.stringify(data)}`]) {
      // return await
      return callCache[`${method}${path}${JSON.stringify(data)}`];
    } else {
      // delete cache
      delete callCache[`${method}${path}${JSON.stringify(data)}`];
    }

    // get id
    const id = nanoid(5);
    console.log('DOING CALL', method, path, data, id);

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

    // check cache
    if (cache) {
      // add to call cache
      callCache[`${method}${path}${JSON.stringify(data)}`] = result;

      // remove after timeout
      callCache[`${method}${path}${JSON.stringify(data)}`].then(() => {
        // check if timed cache
        if (typeof cache === 'number') {
          // remove after timeout
          setTimeout(() => {
            // delete
            delete callCache[`${method}${path}${JSON.stringify(data)}`];
          }, cache);
        } else {
          // delete
          delete callCache[`${method}${path}${JSON.stringify(data)}`];
        }
      });
    }

    // emit
    socket.emit('call', id, method, path, data);

    // return result
    return result;
  };

  // methods
  const fauxSocket = {
    on : socket.on.bind(socket),
    off : socket.off.bind(socket),
    emit : socket.emit.bind(socket),
    once : socket.once.bind(socket),
    socket : socket,

    get : (path, data) => socket.call('GET', path, data),
    put : (path, data) => socket.call('PUT', path, data),
    post : (path, data) => socket.call('POST', path, data),
    patch : (path, data) => socket.call('PATCH', path, data),
    delete : (path, data) => socket.call('DELETE', path, data),
  };

  // to window
  window.NFTSocket = fauxSocket;

  // return jsx
  return (
    <SocketContext.Provider value={ fauxSocket }>
      { props.children }
    </SocketContext.Provider>
  );
};

// export default
export default SocketProvider;