import { Container } from '@mui/material';
import React from 'react';

const Manage = () => {
    return (
        <Container sx={ {
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#282c34',
            height: '100%',
            width: '100%'
        } }>
            <h1>This is the management page</h1>
        </Container>
    );
}

export default Manage;