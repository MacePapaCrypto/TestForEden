
// import
import React from 'react';
import { useDesktop } from '@moonup/ui';

// create component
const ReactWrapper = (props = {}) => {
  // use desktop
  const desktop = useDesktop();

  // return jsx
  return (
    <div />
  );
};

// react wrapper
export default (
  <ReactWrapper />
);