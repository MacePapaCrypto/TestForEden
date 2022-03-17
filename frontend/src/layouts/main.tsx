
import React from 'react';

/**
 * home page
 *
 * @param props 
 */
const MainLayout = (props = {}) => {

  // return jsx
  return (
    <div>
      { props.children }
    </div>
  );
};

// export default
export default MainLayout;