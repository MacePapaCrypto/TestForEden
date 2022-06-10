
// import auth context
import DesktopContext from './DesktopContext';
import React, { useContext } from 'react';

// use auth hook
const useDesktop = () => {
  // use context
  const auth = useContext(DesktopContext);

  // return auth
  return auth;
};

// export default
export default useDesktop;