
// react
import { createTheme } from '@mui/material';

// create theme
const mainTheme = createTheme({
  palette : {
    mode    : 'dark',
    primary : {
      main : '#001e3c',
    },
    background : {
      default : '#0A1929',
    }
  }
});

// theme
window.theme = mainTheme;

// export default
export default mainTheme;