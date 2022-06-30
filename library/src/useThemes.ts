
// import auth context
import ThemeContext from './Desktop/Context';
import React, { useContext } from 'react';

// use auth hook
const useThemes = () => {
  // use context
  const themes = useContext(ThemeContext);

  // return auth
  return themes;
};

// export default
export default useThemes;