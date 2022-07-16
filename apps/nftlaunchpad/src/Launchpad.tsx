import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import './App.css';
import Deploy from './components/deploy/Deploy';
import LandingPage from './components/landing/LandingPage';
import Manage from './components/manage/Manage';

function Launchpad() {
  return (
    <div className="App">
      <Router>
          <Routes>
            <Route path='/' element={<LandingPage/>}/>
            <Route path='/deploy' element={<Deploy/>}/>
            <Route path='/manage' element={<Manage/>}/>
          </Routes>
      </Router>
    </div>
  );
}

export default Launchpad;
