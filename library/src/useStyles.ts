
import { useTheme } from '@mui/material';
import React, { useMemo } from 'react';

/**
 * use styles
 *
 * @param name 
 */
const useStyles = (name: string) => {
  // get theme
  const theme = useTheme();

  // use memo
  return useMemo(() => {

    // get styles
    let newStyles = {
      ...(theme.components[name]?.styleOverrides || {}),
    };
  
    // check root
    if (typeof newStyles.root === 'function') {
      // setup styles
      newStyles = {
        ...newStyles,
        ...newStyles.root({ theme }),
      };
  
      // delete root
      delete newStyles.root;
    }
  
    // return styles
    return newStyles;
  }, [theme]);
};

/**
 * export default
 */
export default useStyles;