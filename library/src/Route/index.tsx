
// import react
import React, { useState, useContext, useEffect } from 'react';
import Route from 'route-parser';
import Context from '../Window/Context';
import RouteContext from './Context';

/**
 * create app
 *
 * @param props 
 */
const MoonRoute = (props = {}) => {
  // use context
  const task = useContext(Context);

  // create route
  const [route, setRoute] = useState(new Route(props.path));
  const [match, setMatch] = useState(route.match(task.path));

  // use effect
  useEffect(() => {
    // set
    const newRoute = new Route(props.path);

    // set route
    setRoute(newRoute);
    setMatch(newRoute.match(task.path));
  }, [props.path]);

  // use effect
  useEffect(() => {
    // set
    setMatch(route.match(task.path));
  }, [task.path]);

  // check match
  if (!match) return null;

  // return
  return (
    <RouteContext.Provider value={ match }>
      { props.children }
    </RouteContext.Provider>
  );
};

// export default
export default MoonRoute;