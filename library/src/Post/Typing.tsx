
import React from 'react';
import useAuth from '../useAuth';
import { Box, useTheme } from '@mui/material';

const MoonPostTyping = (props = {}) => {
  // theme
  const auth = useAuth();
  const theme = useTheme();

  // get names
  const getNames = () => {
    // actual typing
    const actualTyping = (props.typing || []).filter((t) => `${t.account}`.toLowerCase() !== `${auth.account}`.toLowerCase());

    // check length
    if (!actualTyping.length) return;

    // typing
    if (actualTyping.length > 3) {
      // many people
      return 'Many people are typing...';
    }

    // get typing
    const usernames = actualTyping.slice(0, (props.max || 3)).map((item) => {
      // check if eden
      return `${item.account}`.toLowerCase() === '0x9d4150274f0a67985a53513767ebf5988cef45a4'.toLowerCase() ? 'eden' : 'not eden';
    });

    // check usernames
    if (usernames.length === 1) {
      // is typing
      return `${usernames[0]} is typing...`;
    }

    // return users
    const lastUser = usernames.pop();

    // return done
    return `${usernames.join(', ')} and ${lastUser} are typing...`;
  };

  // return jsx
  return getNames() ? (
    <Box { ...props } color="rgba(255, 255, 255, 0.4)" sx={ {
      ...theme.typography.body2,

      ...(props.sx),
    } }>
      { getNames() }
    </Box>
  ) : null;
};

// export default
export default MoonPostTyping;