
// import auth context
import { useAuth, useSocket } from '@moonup/ui';
import React, { useEffect, useState } from 'react';

// use auth hook
const useTags = (props = {}) => {
  // socket
  const auth = useAuth();
  const socket = useSocket();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState('list');
  const [updated, setUpdated] = useState(new Date());

  // load
  const listTags = async () => {
    // set loading
    setLoading('list');

    // loaded
    let loadedTags = [];

    // try/catch
    try {
      // loaded
      loadedTags = await socket.get('/tag/list');

      // tags
      for (let i = (tags.length - 1); i >= 0; i--) {
        // check if tag
        if (!loadedTags.find((s) => s.type === tags[i].type)) {
          // removed
          tags.splice(i, 1);
        }
      }

      // replace all info
      loadedTags.forEach((tag) => {
        // local
        const localTag = tags.find((s) => s.type === tag.type);

        // check local tag
        if (!localTag) return tags.push(tag);

        // update info
        Object.keys(tag).forEach((key) => {
          // tag key
          localTag[key] = tag[key];
        });
      });

      // set tags
      setUpdated(new Date());
    } catch (e) {
      // loading
      setLoading(null);
      throw e;
    }

    // set loading
    setLoading(null);

    // return tags
    return loadedTags;
  };
  
  // load from socket
  useEffect(() => {
    // load from socket
    listTags();

    // on connect
    socket.socket.on('connect', listTags);

    // done
    return () => {
      // off connect
      socket.socket.removeListener('connect', listTags);
    };
  }, [auth?.account]);

  console.log('test', tags);

  // return tags
  const MoonTags = {
    list : listTags,

    tags,
    loading,
    updated,
  };

  // return
  return MoonTags;
};

// export default
export default useTags;