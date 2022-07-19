import React from 'react';
import DeployModal from './DeployModal';
import OptionCardAnchor from './OptionCardAnchor';
import OptionCardRouter from './OptionCardRouter';
import { Route  } from '@moonup/ui';
import { Grid, Container } from '@mui/material';

const Deploy = () => {
    return (
        <Container sx={ {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            justifyContent: 'center',
            height: 'auto'
        } }>
            <h2>Deploy an NFT Contract</h2>
            <Grid container spacing={2} xs={6} sm={12}>
                <OptionCardAnchor description="Check Out the Documentation" buttonWords="Learn More"/>
                <OptionCardRouter description="Deploy an NFT Contract" buttonWords="Start Building"/>
            </Grid>
            <Route path="/deploy/startDeploy">
                <DeployModal/>
            </Route>
        </Container>
    );
}

export default Deploy;