import { useContext, useEffect } from 'react';
import { useMachine } from "@xstate/react";
import { connectMachine } from "./../stateMachines/connectMachine";
import { checkNetwork } from '../functions/ethersFunctions';
import Button from '@mui/material/Button';

declare const window:any;

function ConnectWallet() {
  
  const [state, send]:any = useMachine(connectMachine, { devTools: true });
  const { walletAddress, walletContext } = state.context;

  useEffect(() => {
    console.log('walletContextDetected: ', false);
  }, [walletContext]);

  const connectWalletFunction = async () => {

    if (window.ethereum !== undefined && !checkNetwork()) {
      console.log("wallet connect error");
      return;
    }

    const foundAddress = await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log(foundAddress);

    if (foundAddress[0] !== undefined){
      connectMachine.transition(state, "CONNECT");
      send({ type: "SET_CONTEXT", value: true });
      send({ type: "SET_ADDRESS", value: foundAddress[0] });
    }
  }

  return (
    <Button onClick={connectWalletFunction}>
      { walletAddress === "" ? "Connect" : "Connected" }
    </Button>
  );
}

export default ConnectWallet;
