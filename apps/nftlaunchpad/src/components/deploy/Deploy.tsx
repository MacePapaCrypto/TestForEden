import React from 'react';
import "./deploy.css";
import DeployModal from './DeployModal';
import OptionCardAnchor from './OptionCardAnchor';
import OptionCardRouter from './OptionCardRouter';
import { Route  } from '@moonup/ui';

const Deploy = () => {
    return (
        <header className='App-header'>
            <h2>Deploy an NFT Contract</h2>
            <div className='deployCardsContainer'>
                <OptionCardAnchor description="Check Out the Documentation" buttonWords="Learn More"/>
                <OptionCardRouter description="Deploy an NFT Contract" buttonWords="Start Building"/>
            </div>
            <Route path="/deploy/startDeploy">
                <DeployModal/>
            </Route>
        </header>
    );
}

export default Deploy;