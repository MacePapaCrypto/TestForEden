
// react
import { createTheme } from '@mui/material';

// create theme
const mainTheme = createTheme({
  palette : {
    mode    : 'dark',
    text    : {
      primary : '#c9d1d9',
    },
    divider : '#30363d',
    primary : {
      main  : '#fdc07b',
    },
    background : {
      paper   : '#0D1116',
      default : '#01040A',
    }
  },
  typography : {
    fontFamily : `'Roboto', sans-serif`,
  },
  components : {
    MuiLink : {
      defaultProps : {
        underline : 'none',
      }
    },
    MuiPaper : {
      styleOverrides : {
        root : {
          backgroundImage : 'none',
        }
      }
    },
  },
});

// theme
window.theme = mainTheme;

// export default
export default mainTheme;