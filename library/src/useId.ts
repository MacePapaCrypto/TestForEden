
// import auth context
import React from 'react';
import { customAlphabet } from 'nanoid';

// create alphabet
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 40);

// use auth hook
const useId = () => {
  // return auth
  return nanoid;
};

// export default
export default useId;