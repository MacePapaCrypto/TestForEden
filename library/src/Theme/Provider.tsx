
// socketio client
import React from 'react';
import mainTheme from './index';
import { ThemeProvider } from '@mui/material';

// socket context
const MoonThemeProvider = (props = {}) => {
  // return jsx
  return (
    <ThemeProvider theme={ mainTheme }>
      { props.children }
    </ThemeProvider>
  );
};

// export default
export default MoonThemeProvider;