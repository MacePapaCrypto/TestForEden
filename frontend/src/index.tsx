
// regenerator
import 'setimmediate';
import regeneratorRuntime from 'regenerator-runtime';
window.regeneratorRuntime = regeneratorRuntime;

// import react
import React, { useEffect, useState } from 'react';

// import react
import ReactDOM from 'react-dom';
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
import NftPage from './pages/nft';
import PostPage from './pages/post';
import HomePage from './pages/home';
import FeedPage from './pages/feed';

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

              <Route exact path="/s/:segment">
                <MainLayout>
                  <FeedPage />
                </MainLayout>
              </Route>
              <Route exact path="/c/:context">
                <MainLayout>
                  <FeedPage />
                </MainLayout>
              </Route>
              <Route exact path="/a/:account">
                <MainLayout>
                  <FeedPage />
                </MainLayout>
              </Route>
              <Route exact path="/n/:account">
                <MainLayout>
                  <NftPage />
                </MainLayout>
              </Route>
              <Route exact path="/p/:post">
                <MainLayout>
                  <PostPage />
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
window.app = ReactDOM.render(<Main />, document.getElementById('app'));