
// import auth nft
import moment from 'moment';
import useSocket from './useSocket';
import React, { useState, useEffect } from 'react';

// use auth hook
const useNFTs = (props = {}) => {
  // socket
  const socket = useSocket();
  const [updated, setUpdated] = useState(new Date());
  const [loading, setLoading] = useState(null);
  
  // let nfts
  let [nfts, setNFTs] = useState([]);

  // get nft
  const getNFT = async (id) => {
    // check found
    if (!id) return;

    // check found
    const found = nfts.find((s) => s.id === id);

    // check found
    if (found) return found;

    // load
    const backendNFT = await socket.get(`/nft/${id}`);

    // return backend nft
    return backendNFT;
  };

  // replace or create
  const createOrReplace = (nft) => {
    // check filter
    const filter = { ...props };

    // check nft in context
    const filterSpace = filter.space;
    const filterThread = filter.thread;
    const filterAccount = filter.account;

    // filter
    if (!filterThread && !filterAccount && !filterSpace) return;
    
    // found nft
    const foundNFT = nfts.find((p) => p.id === nft.id || p.temp === nft.temp || p.temp === nft.id);

    // create or replace nft
    if (!foundNFT) {
      // nft elements
      const nftSpace = nft.space?.id || nft.space;
      const nftThread = nft.thread?.id || nft.thread;
      const nftAccount = nft.account?.id || nft.account;

      // check
      if (filterSpace && (!nftSpace || (nftSpace !== filterSpace))) {
        return;
      }
      if (filterThread && (!nftThread || (nftThread !== filterThread))) {
        return;
      }
      if (filterAccount && (!nftAccount || (nftAccount !== filterAccount))) {
        return;
      }

      // check filter
      if (filter.feed === 'chat') {
        filter.dir = filter.dir || 'desc';
        filter.sort = filter.sort || 'createdAt';
      }

      // new nfts
      nfts = [nft, ...nfts].sort((a, b) => {
        // sorted
        if (!filter.dir || !filter.sort) return 0;

        // get field
        let filterA = a[filter.sort];
        let filterB = b[filter.sort];

        // check if date
        if (moment(filterA).isValid() && moment(filterB).isValid()) {
          filterA = new Date(filterA);
          filterB = new Date(filterB);
        }

        // return
        if (filterA > filterB) return filter.dir === 'asc' ? 1 : -1;
        if (filterB > filterA) return filter.dir === 'asc' ? -1 : 1;
        return 0;
      });

      // set nfts
      setNFTs(nfts);
      return setUpdated(new Date());
    }

    // changed
    let changed = false;

    // find
    Object.keys(nft).forEach((key) => {
      // check
      if (JSON.stringify(foundNFT[key]) !== JSON.stringify(nft[key])) changed = true;

      // update
      foundNFT[key] = nft[key];
    });

    // set nfts
    if (changed) {
      nfts = [...nfts];
      setNFTs(nfts);
      setUpdated(new Date());
    }
  };

  // emit
  const emitNFT = (nft) => {
    // update nft
    createOrReplace(nft);
  };

  // load
  const listNFTs = async () => {
    // check filter
    const filter = { ...props };

    // check filter
    if (!filter.contract && !filter.account) return;

    // set loading
    nfts = [];
    setLoading('list');
    setNFTs([]);

    // check filter
    if (props.feed === 'new') {
      filter.dir = filter.dir || 'desc';
      filter.sort = filter.sort || 'createdAt';
    } else if (props.feed === 'hot') {
      filter.dir = filter.dir || 'desc';
      filter.sort = filter.sort || 'rank.score';
    }

    // loaded
    let loadedNFTs = [];

    // try/catch
    try {
      // loaded
      loadedNFTs = await socket.get('/nft/list', filter);

      // set nfts
      nfts = loadedNFTs;
      setNFTs(nfts);
      setUpdated(new Date());
    } catch (e) {
      // loading
      setLoading(null);
      throw e;
    }

    // set loading
    setLoading(null);

    // return nfts
    return loadedNFTs;
  };
  
  // load from socket
  useEffect(() => {
    // load from socket
    listNFTs();

    // remove old listener
    socket.socket.on('nft', emitNFT);

    // done
    return () => {
      // off connect
      socket.socket.removeListener('nft', emitNFT);
    };
  }, [JSON.stringify(props)]);

  // return nfts
  const actualNFTs = {
    get  : getNFT,
    list : listNFTs,

    nfts,
    updated,
    loading,
  };

  // nft feed
  window.NFTNFTs = actualNFTs;

  // return feed
  return actualNFTs;
};

// export default
export default useNFTs;