// darken
import { darken } from '@mui/material/styles';

// create theme
export default {
  palette : {
    mode : 'dark',
    text : {
      
    },
    border  : {
      active  : '#808080',
      primary : '#30363d',
    },
    divider : '#30363d',
    primary : {
      main  : '#FA627D',
    },
    background : {
      paper   : '#222526',
      default : '#101315',
    }
  },
  typography : {
    fontFamily : `'Inter', sans-serif`,
  },
  components : {
    MoonApp : {
      styleOverrides : {
        root : ({ theme }) => ({
          flex          : 1,
          display       : 'flex',
          background    : theme.palette.background.paper,
          flexDirection : 'column',

          borderBottomRightRadius : `${theme.shape.borderRadius * 2}px`,

          '&.MoonApp-withMenu.MoonApp-shown, &.MoonApp-withSub' : {
            borderTopLeftRadius  : `${theme.shape.borderRadius * 2}px`,
          }
        }),
      }
    },
    MoonAppSideBar : {
      styleOverrides : {
        root : ({ theme }) => ({
          px               : (theme.shape.borderWidth ? theme.spacing(2) : 0),
          py               : theme.spacing(2),
          width            : theme.shape.sidebarWidth,
          height           : '100%',
          background       : darken(theme.palette.background.paper, 0.16),
          borderRightStyle : 'solid',
          borderRightColor : theme.palette.border.primary,
          borderRightWidth : theme.shape.borderWidth,
          
          borderTopLeftRadius : `${theme.shape.borderRadius * 2}px`,
  
          '&:empty' : {
            display : 'none',
          },
          '&.MoonAppSideBar-collapsed' : {
            px       : 0,
            width    : 0,
            overflow : 'hidden',
          },
          '&.MoonAppSideBar-root.MoonAppSideBar-withoutSub' : {
            borderTopLeftRadius : 0,
          },
          '&.MoonAppSideBar-collapsed > .MoonAppSideBar-content' : {
            display : 'none',
          },
        }),
      }
    },
    MoonWindow : {
      defaultProps : {
        elevation : 3,
      },
      styleOverrides : {
        root : ({ theme }) => ({
          width         : '100%',
          height        : '100%',
          display       : 'flex',
          background    : darken(theme.palette.background.paper, 0.32),
          borderWidth   : theme.shape.borderWidth,
          borderStyle   : 'solid',
          borderColor   : theme.palette.border.primary,
          borderRadius  : 2,
          flexDirection : 'column',

          '&.MoonWindow-active' : {
            borderColor : theme.palette.border.active,
          },
          '&.MoonWindow-electron' : {
            borderWidth : 0,
          }
        }),
      },
    },
    MoonWindowBar : {
      styleOverrides : {
        root : ({ theme }) => ({
          width   : '100%',
          height  : theme.shape.windowBarHeight,
          display : 'flex',

          borderTopLeftRadius  : `${theme.shape.borderRadius * 2}px`,
          borderTopRightRadius : `${theme.shape.borderRadius * 2}px`,
        }),
      }
    },
    MoonTaskBar : {
      styleOverrides : {
        root : ({ theme }) => ({
          display : 'flex',

          '&.MoonTaskBar-floating' : {
            margin : theme.spacing(1),
          },
          '&.MoonTaskBar-vertical' : {
            width  : theme.shape.taskBarSize,
            height : '100vh',
          },
          '&.MoonTaskBar-vertical.MoonTaskBar-floating' : {
            height : `calc(100vh - ${theme.spacing(2)})`,
          },
          '&.MoonTaskBar-horizontal' : {
            width  : '100vw',
            height : theme.shape.taskBarSize,
          },
          '&.MoonTaskBar-horizontal.MoonTaskBar-floating' : {
            width : `calc(100vw - ${theme.spacing(2)})`,
          },

          '&.MoonTaskBar-floating .MoonTaskBarContent-root' : {
            border       : `${theme.shape.borderWidth} solid ${theme.palette.border.primary}`,
            borderRadius : 2,
          },
          '&.MoonTaskBar-fixed.MoonTaskBar-left .MoonTaskBarContent-root' : {
            borderRight : `${theme.shape.borderWidth} solid ${theme.palette.border.primary}`,
          },
          '&.MoonTaskBar-fixed.MoonTaskBar-right .MoonTaskBarContent-root' : {
            borderLeft : `${theme.shape.borderWidth} solid ${theme.palette.border.primary}`,
          },
          '&.MoonTaskBar-fixed.MoonTaskBar-top .MoonTaskBarContent-root' : {
            borderBottom : `${theme.shape.borderWidth} solid ${theme.palette.border.primary}`,
          },
          '&.MoonTaskBar-fixed.MoonTaskBar-bottom .MoonTaskBarContent-root' : {
            borderTop : `${theme.shape.borderWidth} solid ${theme.palette.border.primary}`,
          },
        }),
      },
    },
    MoonTaskBarContent : {
      defaultProps : {
        elevation : 3,
      },
      styleOverrides : {
        root : ({ theme }) => ({
          flex       : 1,
          display    : 'flex',
          background : darken(theme.palette.background.paper, 0.32),

          '& .MoonTaskBarContent-stack' : {
            flex : 1,
          },
          '&.MoonTaskBarContent-floating .MoonTaskBarContent-stack' : {
            borderRadius : 2,
          },
          '&.MoonTaskBarContent-vertical .MoonTaskBarContent-stack' : {
            py             : theme.spacing(1),
            justifyContent : 'center',
          },
          '&.MoonTaskBarContent-horizontal .MoonTaskBarContent-stack' : {
            px         : theme.spacing(1),
            alignItems : 'center',
          },
        }),
      },
    },


    MuiLink : {
      defaultProps : {
        underline : 'none',
      }
    },
    MuiPaper : {
      defaultProps : {
        elevation : 1,
      },
      styleOverrides : {
        root : ({ theme }) => ({
          borderWidth     : theme.shape.borderWidth,
          borderStyle     : 'solid',
          borderColor     : theme.palette.border.primary,
          backgroundImage : 'none',
        }),
      },
    },
    MuiCssBaseline : {
      styleOverrides : {
        body : {
          overflow : 'hidden',
        },
      },
    },
    MuiListItemText : {
      styleOverrides : {
        root : ({ theme }) => ({
          borderRadius : 1,
        }),
      },
    },
  },
  shape : {
    borderWidth     : 0,
    taskBarSize     : 98,
    borderRadius    : 4,
    dividerWidth    : 1,
    sidebarWidth    : 240,
    windowBarHeight : 32,
  }
};