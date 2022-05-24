
// import auth post
import useAuth from './useAuth';
import useSocket from './useSocket';
import React, { useState, useEffect } from 'react';

// use auth hook
const useMember = (subject, existingMember = null, type = 'space') => {
  // socket
  const auth = useAuth();
  const socket = useSocket();
    
  // check found
  const subjectId = subject?.id || subject;

  // auth
  const [member, setMember] = useState(existingMember);
  const [loading, setLoading] = useState(!existingMember);
  const [members, setMembers] = useState(subject?.count?.members || 0);

  // get post
  const loadMember = async (id = null) => {
    // check found
    if (!id) id = subjectId;

    // check id
    if (!id) return;

    // check auth
    if (!auth.account) return;

    // check member
    if (existingMember?.id === id) return;

    // loading
    setLoading(true);

    // load
    const backendMember = await socket.get(`/member/${id}`);

    // set post
    setMember(backendMember);
    setLoading(false);

    // return backend post
    return backendMember;
  };

  // add member
  const addMember = async () => {
    // check auth
    if (!auth.account) return auth.login();

    // check id
    if (!subjectId) return;

    // loading
    setLoading(true);

    // load
    const {
      count  : backendCount,
      member : backendMember,
    } = await socket.post(`/member/${subjectId}`, {
      type,
    });

    // set post
    setMember(backendMember);
    setMembers(backendCount);
    setLoading(false);

    // return backend post
    return backendMember;
  };

  // remove member
  const removeMember = async () => {
    // check auth
    if (!auth.account) return auth.login();

    // check id
    if (!subjectId) return;

    // loading
    setLoading(true);

    // load
    const {
      count : backendCount,
    } = await socket.delete(`/member/${subjectId}`, {
      type,
    });

    // set post
    setMember(null);
    setMembers(backendCount);
    setLoading(false);

    // return backend post
    return true;
  };

  // emit user
  const emitMember = (member, count) => {
    // update post
    if (member.from === subjectId) {
      // update
      setMember(member);
      setMembers(count);
    }
  };

  // use effect
  useEffect(() => {
    // check loading
    if (auth.loading) return;
    if (!subjectId) return;

    // load member
    loadMember();

    // add listener
    socket.socket.on('member', emitMember);

    // done
    return () => {
      // off
      socket.socket.removeListener('member', emitMember);
    };
  }, [subjectId, type, auth.account]);

  // return posts
  const actualMember = {
    load   : loadMember,
    create : addMember,
    remove : removeMember,

    member,
    loading,
    members,
  };

  // window
  window.NFTMember = actualMember;

  // return post
  return actualMember;
};

// export default
export default useMember;