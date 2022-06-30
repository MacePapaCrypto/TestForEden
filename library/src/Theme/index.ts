
// react
import { createTheme } from '@mui/material';

// create theme
const mainTheme = createTheme({
  palette : {
    mode    : 'dark',
    text    : {
      primary : '#c9d1d9',
    },
    border  : {
      active  : '#808080',
      primary : '#30363d',
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
    fontFamily : `'Cutive Mono', monospace, 'Roboto', sans-serif`,
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
    MuiCssBaseline : {
      styleOverrides : {
        body : {
          overflow : 'hidden',
        }
      }
    },
  },
  shape : {
    borderWidth  : '.1rem',
    borderRadius : 4,
  }
});

// theme
window.theme = mainTheme;

// export default
export default mainTheme;