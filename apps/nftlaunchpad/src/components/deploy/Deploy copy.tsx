import React from 'react';
import "./deploy.css";
import OptionCardRouter from './OptionCardRouter';
import OptionCardAnchor from './OptionCardAnchor';
import { Route, Routes } from 'react-router-dom';
import DeployModal from './DeployModal';
import ConnectWallet from '../ConnectWallet';

const Deploy = () => {
    return (
        <header className='App-header'>
            <ConnectWallet/>
            <h2>Deploy an NFT Contract</h2>
            <p></p>
            <div className='deployCardsContainer'>
                <OptionCardAnchor description="Check Out the Documentation" buttonWords="Learn More" />
                <OptionCardRouter description="Deploy an NFT Contract" buttonWords="Start Building" buttonLink="startDeploy"/>
            </div>
            <Routes>
                <Route path="startDeploy/*" element={<DeployModal/>}/>
            </Routes>
        </header>
    );
}

export default Deploy;