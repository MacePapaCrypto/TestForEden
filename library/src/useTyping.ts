
// import socket context
import React, { useEffect, useState } from 'react';
import useSocket from './useSocket';

// use socket hook
const useTyping = (props = {}) => {
  // state
  const socket = useSocket();
  let [typing, setTyping] = useState([]);

  // create typing
  const createTyping = (way) => {
    // send typing
    socket.post(`/typing/${props.thread}`, {
      typing : way ? 'true' : 'false',
    });
  };

  // update typing
  const updateTyping = (thread, user) => {
    // check thread
    if (!thread || !props.thread) return;
    if (!thread.toLowerCase().includes(props.thread.toLowerCase())) return;

    // find typing
    const actualTyping = typing.find((t) => t.account === user.account);

    // check
    if (actualTyping) {
      // clear timeout
      clearTimeout(actualTyping.timeout);
    }

    // filter
    typing = [...typing].filter((t) => t.account !== user.account);

    // update typing
    if (user.typing) {
      // add timeout
      user.timeout = setTimeout(() => {
        // update typing to false
        updateTyping(thread, {
          ...user,
          typing : false,
        });
      }, props.timeout || (5 * 1000));

      // push user
      typing.push(user)
    }

    // tying
    setTyping(typing);
  };

  // use effect
  useEffect(() => {
    // remove old listener
    socket.socket.on('typing', updateTyping);

    // done
    return () => {
      // off connect
      socket.socket.removeListener('typing', updateTyping);
    };
  }, [props.thread]);

  // return
  return {
    typing,

    update : createTyping,
  };
};

// export default
export default useTyping;