
// import auth context
import AuthContext from './AuthContext';
import React, { useContext } from 'react';

// use auth hook
const useAuth = () => {
  // use context
  const auth = useContext(AuthContext);

  // return auth
  return auth;
};

// export default
export default useAuth;