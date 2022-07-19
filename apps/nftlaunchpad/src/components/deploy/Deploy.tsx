import React from 'react';
import "./deploy.css";
import OptionCardAnchor from './OptionCardAnchor';
import OptionCardRouter from './OptionCardRouter';

const Deploy = () => {
    return (
        <header className='App-header'>
            <h2>Deploy an NFT Contract</h2>
            <div className='deployCardsContainer'>
                <OptionCardAnchor description="Check Out the Documentation" buttonWords="Learn More"/>
                <OptionCardRouter description="Deploy an NFT Contract" buttonWords="Start Building"/>
            </div>
        </header>
    );
}

export default Deploy;