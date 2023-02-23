import { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';
import { fixedInputSwap } from '../operation/swap/fixedInputSwap';

const peraWallet = new PeraWalletConnect();

export default function PeraWalletConnection() {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const isConnectedToPeraWallet = !!accountAddress;

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    console.log(event.target.value);
    const account: string = accountAddress as string;
    const asset1 = '0';
    const asset2 = '523683256';
    await fixedInputSwap({ account, asset_1: asset1, asset_2: asset2 });
  };

  const handleClick = (event: MouseEvent) => {
    console.log('Submit button clicked!');
  };

  useEffect(() => {
    // Reconnect to the session when the component is mounted
    peraWallet
      .reconnectSession()
      .then((accounts) => {
        peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

        if (accounts.length) {
          setAccountAddress(accounts[0]);
        }
      })
      .catch((e) => console.log(e));
  }, []);

  return (
    <div>
      <button onClick={isConnectedToPeraWallet ? handleDisconnectWalletClick : handleConnectWalletClick}>
        {isConnectedToPeraWallet ? 'Disconnect' : 'Connect to Pera Wallet'}
      </button>
      <br />
      <br />
      {accountAddress}
      <br />
      <br />
      input asset <input type="text" />
      output asset <input type="text" />
      <br />
      input amount <input value={inputValue} onChange={handleInputChange} />
      output amount <input type="text" />
      <button onClick={handleClick}>Submit</button>
    </div>
  );

  function handleConnectWalletClick() {
    peraWallet
      .connect()
      .then((newAccounts) => {
        peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

        setAccountAddress(newAccounts[0]);
      })
      .catch((error) => {
        if (error?.data?.type !== 'CONNECT_MODAL_CLOSED') {
          console.log(error);
        }
      });
  }

  function handleDisconnectWalletClick() {
    peraWallet.disconnect();

    setAccountAddress(null);
  }
}
