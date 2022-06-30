
// socketio client
import React, { useEffect, useState } from 'react';

// socket context
import useId from '../useId';
import Context from './Context';
import SocketEmitter from './Emitter';

// socket context
const MoonSocketProvider = (props = {}) => {
  // use id
  const nanoid = useId();

  // session id
  const ssid = localStorage?.getItem('ssid') || `${nanoid()}`;

  // set item
  localStorage?.setItem('ssid', ssid);

  // updated
  const [updated, setUpdated] = useState(new Date());

  // create emitter
  const [emitter, setEmitter] = useState(() => {
    // return emitter
    return window.socketEmitter || new SocketEmitter({
      url : props.url,
      ssid,
    });
  });

  // use effect
  useEffect(() => {
    // do props
    emitter.props({
      url : props.url,
      ssid,
    });
  }, [props]);

  // use effect
  useEffect(() => {
    // check emitter
    if (!emitter) return;
    
  }, [emitter]);

  // to window
  window.MoonSocket = emitter?.state;

  // return jsx
  return (
    <Context.Provider value={ emitter?.state }>
      { props.children }
    </Context.Provider>
  );
};

// export default
export default MoonSocketProvider;