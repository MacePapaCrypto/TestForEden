
// import auth post
import React from 'react';

// use auth hook
const usePost = (space, member) => {
  // use acls
  const roles = (space?.roles || []).filter((r) => (member?.roles || []).includes(r.id));

  // reduce
  const acls = Array.from(new Set(roles.reduce((accum, role) => {
    // push
    accum.push(...(role.acls || []));
    return accum;
  }, [])));

  // create can
  const can = (acl) => {
    // includes
    if (acls.includes('*')) return true;
    
    // return split
    if (acls.includes(acl)) return true;

    // split
    const split = acl.split(':');

    // for
    while (split.length) {
      // check helps
      if (acls.includes(`${split.join(':')}:*`)) return true;

      // pop
      split.pop();
    }
  };

  // acls
  can.acls = acls;

  // return post
  return can;
};

// export default
export default usePost;