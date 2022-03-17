

// import react
import React, { useEffect, useState } from 'react';
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
    
	}, [typeof window === 'undefined'])

	// return jsx
	return (
    <BrowserRouter>
      
      <Switch>
        <Route exact path="/">
          <MainLayout>
            <HomePage />
          </MainLayout>
        </Route>
        
      </Switch>
      
    </BrowserRouter>
	);
};

// export default
export default Main;