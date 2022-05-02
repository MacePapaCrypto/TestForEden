// import ract
import React from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material';

// styled link
const StyledLink = styled(Link)`
  text-decoration: none;

  &:focus, &:hover, &:visited, &:link, &:active {
    text-decoration: none;
  }
`;

// export default
export default (props) => <StyledLink {...props} />;