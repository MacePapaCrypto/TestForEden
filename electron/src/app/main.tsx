
// import react
import React, { useState, useEffect } from 'react';

// import react
import { BrowserRouter } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { AuthProvider, DesktopProvider, SocketProvider, ThemeProvider, useDesktop, Window } from '@moonup/ui';

// main page
const Main = (props = {}) => {
  // task
  const [task, setTask] = useState(props.task);

  // desktop
  const desktop = useDesktop();

	// use effect
	useEffect(() => {
		// typeof
		if (typeof window === 'undefined') return;
    
	}, [typeof window === 'undefined']);

  // set task
  if (props.onUpdater) props.onUpdater(setTask);

	// return jsx
	return (
    <ThemeProvider>
      <CssBaseline />
      
      <SocketProvider>
        <AuthProvider>
            <BrowserRouter>
              <DesktopProvider>
                { !!task && (
                  <Box height="100vh" width="100vw">
                    <Window
                      key={ `window-${task.id}` }
                      item={ task }
                      desktop={ desktop }
                      position={ null }
                      isElectron
                      
                      onMoveUp={ (e) => {} }
                      onMoveDown={ (e) => {} }
                      bringToFront={ (id) => {} }
                    />
                  </Box>
                ) }
              </DesktopProvider>
            </BrowserRouter>
        </AuthProvider>
      </SocketProvider>
    </ThemeProvider>
	);
};

// export default
export default Main;