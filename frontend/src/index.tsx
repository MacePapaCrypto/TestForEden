
// regenerator
import 'setimmediate';
import regeneratorRuntime from 'regenerator-runtime';
window.regeneratorRuntime = regeneratorRuntime;

// import react
import React, { useEffect } from 'react';

// import react
import { createRoot } from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import { AuthProvider, SocketProvider, ThemeProvider } from '@moonup/ui';
import {
  Route,
  Switch,
  BrowserRouter,
} from 'react-router-dom';

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
    <ThemeProvider>
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