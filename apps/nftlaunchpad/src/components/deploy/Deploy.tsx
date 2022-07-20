import React from 'react';
import DeployModal from './DeploySteps';
import OptionCardAnchor from './OptionCardAnchor';
import OptionCardRouter from './OptionCardRouter';
import { Route  } from '@moonup/ui';
import { Grid, Container } from '@mui/material';

const Deploy = (props = {}) => {
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
            <h2>Deploy an NFT Contract</h2>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <OptionCardAnchor { ...props } description="Check Out the Documentation" buttonWords="Learn More"/>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <OptionCardRouter { ...props } description="Deploy an NFT Contract" buttonWords="Start Building"/>
                </Grid>                  
            </Grid>
        </Container>
    );
}

export default Deploy;