
// react
import { createTheme } from '@mui/material';

// create theme
const mainTheme = createTheme({
  palette : {
    mode    : 'dark',
    primary : {
      main  : '#fdc07b',
    },
    background : {
      paper   : 'rgba(255, 255, 255, 0)',
      default : '#0A1929',
    }
  }
});

// theme
window.theme = mainTheme;

// export default
export default mainTheme;