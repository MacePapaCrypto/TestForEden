
// regenerator
import 'setimmediate';
import regeneratorRuntime from 'regenerator-runtime';
window.regeneratorRuntime = regeneratorRuntime;

// import react
import React, { useEffect } from 'react';

// import react
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, SocketProvider } from '@nft/ui';
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

// main page
const Main = (props = {}) => {
	// use effect
	useEffect(() => {
		// typeof
		if (typeof window === 'undefined') return;
    
	}, [typeof window === 'undefined']);

	// return jsx
	return (
    <ThemeProvider theme={ mainTheme }>
      <CssBaseline />
      
      <SocketProvider url="wss://nft.edenup.com">
        <AuthProvider>
          <BrowserRouter>
          
            <Switch>
              <Route exact path="/">
                <MainLayout>
                  <HomePage />
                </MainLayout>
              </Route>
            </Switch>
          
          </BrowserRouter>
        </AuthProvider>
      </SocketProvider>
    </ThemeProvider>
	);
};

// render
window.app = createRoot(document.getElementById('app'));
window.app.render(<Main />);