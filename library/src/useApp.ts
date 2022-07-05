
// react
import * as Mui from '@mui/material';
import ReactDOM from 'react-dom';
import UMDFetcher from 'umd-fetcher';
import * as MoonUi from './index';
import React, { useEffect, useState } from 'react';

// font awesome
import * as FontAwesome from '@fortawesome/react-fontawesome';
import * as FontAwesomeRegular from '@fortawesome/pro-regular-svg-icons';

// app cache
const appCache = {};
const appLoads = {};

// use auth hook
const useApp = (app, path) => {
  // loading
  const [loading, setLoading] = useState(!appCache[app?.url]);

  // require modules
  const requireModules = {
    react           : React,
    'react-dom'     : ReactDOM,
    '@moonup/ui'    : Mui,
    '@mui/material' : MoonUi,


    // optional
    '@fortawesome/react-fontawesome'     : FontAwesome,
    '@fortawesome/pro-regular-svg-icons' : FontAwesomeRegular
  };

  // set to globals
  if (!window.Mui) window.Mui = Mui;
  if (!window.React) window.React = React;
  if (!window.MoonUi) window.MoonUi = MoonUi;
  if (!window.ReactDOM) window.ReactDOM = ReactDOM;
  if (!window.FontAwesome) window.FontAwesome = FontAwesome;
  if (!window.FontAwesomeRegular) window.FontAwesomeRegular = FontAwesomeRegular;

  // create require
  const createRequire = () => {
    // check require
    if (window.requireCreated) return;

    // create require
    window.require = (mod) => {
      // check module
      return requireModules[mod];
    };
    window.requireCreated = true;
  };

  // load app
  const loadApp = async () => {
    // check url
    if (!app?.url) return;

    // create require
    createRequire();

    // check cache
    if (appCache[app.url]) {
      // set app
      setLoading(false);

      // return
      return;
    }

    // await existing load
    if (appLoads[app.url]) {
      // await
      await appLoads[app.url];

      // set app
      setLoading(false);

      // return
      return;
    }

    // create loader
    appLoads[app.url] = (async () => {
      // try/catch
      try {
        // fetch module
        const module = await UMDFetcher.fetch({
          url  : `https://app.moon.social/${app.url}`,
          name : app.package,
        });

        // set module
        appCache[app.url] = module;

        // return module
        return module;
      } catch (e) {
        return null;
      }
    })();

    // await
    await appLoads[app.url];
    
    // set app
    setLoading(false);
  };

  // use effect
  useEffect(() => {
    // load url
    loadApp();
  }, [app?.url]);

  // moon app
  const MoonApp = {
    App : appCache[app?.url],
    loading,
  };

  // return moon app
  return MoonApp;
};

// export default
export default useApp;