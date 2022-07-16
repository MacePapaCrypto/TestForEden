import React from 'react';
import "./deploy.css";
import OptionCard from './OptionCard';

const Deploy = () => {
    return (
        <header className='App-header'>
            <div className='homeIcon'>
                <span className="material-icons-outlined"></span>
            </div>
            <h2>Deploy an NFT Contract</h2>
            <div className='deployCardsContainer'>
                <OptionCard description="Check Out the Documentation" buttonWords="Learn More"/>
                <OptionCard description="Deploy an NFT Contract" buttonWords="Start Building"/>
            </div>
        </header>
    );
}

export default Deploy;