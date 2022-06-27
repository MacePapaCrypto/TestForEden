
import React, { useContext } from 'react';
import Context from './Route/Context';

/**
 * use params
 */
const useParams = () => {
  // context
  const context = useContext(Context);

  // return auth
  return context;
};

// export default
export default useParams;