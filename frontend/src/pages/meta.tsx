
import React from 'react';

// create metadata
const Metadata = (props = {}) => {

  // title
  let title = `Moon Social${props.title ? ` | ${props.title}` : ''}`;

  // return jsx
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />

      <title>{ title }</title>

      <meta name="robots" content="index, follow" />

      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap" rel="stylesheet" />
    </>
  );
};

// export defualt
export default Metadata;