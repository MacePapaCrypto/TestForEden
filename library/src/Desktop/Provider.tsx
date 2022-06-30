
// socketio client
import useAuth from '../useAuth';
import useSocket from '../useSocket';
import DesktopContext from './Context';
import React, { useEffect, useState } from 'react';

// emitter
import DesktopEmitter from './Emitter';

// socket context
const MoonDesktopProvider = (props = {}) => {
  // socket
  const auth = useAuth();
  const socket = useSocket();

  // updated
  const [updated, setUpdated] = useState(() => {
    // return date
    return new Date();
  });

  // create emitter
  const [emitter, setEmitter] = useState(() => {
    // return emitter
    return window.desktopEmitter || new DesktopEmitter({
      ...props,
  
      auth,
      socket,
    });
  });

  // use effect
  useEffect(() => {
    // do props
    emitter.props({ props, auth });
  }, [props]);

  // use effect
  useEffect(() => {
    // do props
    emitter.props({ auth });
  }, [auth?.account]);

  // use effect
  useEffect(() => {
    // check emitter
    if (!emitter) return;

    // create listener
    const onUpdated = () => setUpdated(new Date());

    // add listener
    emitter.on('updated', onUpdated);
    emitter.on('loading', onUpdated);
    emitter.on('desktop', onUpdated);
    emitter.on('activeTask', onUpdated);

    // return
    return () => {
      // return done
      emitter.removeListener('updated', onUpdated);
      emitter.removeListener('loading', onUpdated);
      emitter.removeListener('desktop', onUpdated);
      emitter.removeListener('activeTask', onUpdated);
    };
  }, [emitter]);

  // nft desktops
  window.MoonDesktop = emitter?.state;

  // return jsx
  return (
    <DesktopContext.Provider value={ emitter?.state }>
      { props.children }
    </DesktopContext.Provider>
  );
};

// export default
export default MoonDesktopProvider;