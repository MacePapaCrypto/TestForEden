
// regenerator
import regeneratorRuntime from 'regenerator-runtime';
window.regeneratorRuntime = regeneratorRuntime;

// import react
import ReactDOM from 'react-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  Route,
  Switch,
  BrowserRouter,
} from 'react-router-dom';

// themes
import mainTheme from './themes/main';

// layouts
import MainLayout from './layouts/main';

// pages
import HomePage from './pages/home';
import LoginPage from './pages/login';

// main page
const Main = (props = {}) => {
  // account
  const [account, setAccount] = useState(true);

	// use effect
	useEffect(() => {
		// typeof
		if (typeof window === 'undefined') return;
    
	}, [typeof window === 'undefined']);

	// return jsx
	return (
    <ThemeProvider theme={ mainTheme }>
      <CssBaseline />
      <BrowserRouter>
      
        <Switch>
          { account ? (
            <>
              <Route exact path="/">
                <MainLayout>
                  <HomePage />
                </MainLayout>
              </Route>
            </>
          ) : (
            <Route exact path="/">
              <MainLayout>
                <LoginPage />
              </MainLayout>
            </Route>
          ) }
          
        </Switch>
      
      </BrowserRouter>
    </ThemeProvider>
	);
};

// render
window.app = ReactDOM.render(<Main />, document.getElementById('app'));