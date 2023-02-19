import "./_app.scss";

import { Button } from "@hipo/react-ui-toolkit";
import { useEffect, useState } from "react";
import { PeraWalletConnect } from "@perawallet/connect";

import {
  generateAssetTransferTxns,
  generateOptIntoAssetTxns,
  generatePaymentTxns
} from "./utils/txnUtils";
import { truncateAccountAddress } from "./utils/stringUtils";
import algod from "./utils/algod";

// shouldShowSignTxnToast is by default true,
// you can set it to false to disable the guidance completely
const peraWallet = new PeraWalletConnect({ shouldShowSignTxnToast: true });

function App() {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const isConnectedToPeraWallet = !!accountAddress;
  const [isRequestPending, setIsRequestPending] = useState(false);

  //////
  // this is just for demo purposes, no need to in real-life apps
  const [logs, setLogs] = useState<string[]>([]);
  //////

  useEffect(() => {
    peraWallet
      .reconnectSession()
      .then((accounts) => {
        if (accounts.length) {
          setAccountAddress(accounts[0]);

          handleSetLog("Connected to Pera Wallet");
        }

        peraWallet.connector?.on("disconnect", () => {
          setAccountAddress(null);
        });
      })
      .catch((e) => console.log(e));
  }, []);

  return (
    <div className={"app"}>
      <h1 className={"app__title"}>
        {"Pera Wallet"} <small>{"Example dApp"}</small>
      </h1>

      {accountAddress && (
        <div
          className={"app__account-address"}
        >{`Connected to: ${truncateAccountAddress(accountAddress)}`}</div>
      )}

      <Button
        customClassName={"app__button"}
        onClick={
          isConnectedToPeraWallet
            ? handleDisconnectWalletClick
            : handleConnectWalletClick
        }
      >
        {isConnectedToPeraWallet ? "Disconnect" : "Connect to Pera Wallet"}
      </Button>

      {isConnectedToPeraWallet && (
        <div className={"app__actions"}>
          <Button
            customClassName={"app__button"}
            onClick={handleOptinAsset}
            shouldDisplaySpinner={isRequestPending}
            isDisabled={isRequestPending}
          >
            {isRequestPending ? "Loading..." : "Opt-in to asset"}
          </Button>

          <Button
            customClassName={"app__button"}
            onClick={handleSignPaymentTransaction}
            shouldDisplaySpinner={isRequestPending}
            isDisabled={isRequestPending}
          >
            {isRequestPending ? "Loading..." : "Payment Transaction"}
          </Button>

          <Button
            customClassName={"app__button"}
            onClick={handleSignAssetTransferTransaction}
            shouldDisplaySpinner={isRequestPending}
            isDisabled={isRequestPending}
          >
            {isRequestPending ? "Loading..." : "Asset Transfer"}
          </Button>

          <Button
            customClassName={"app__button"}
            onClick={handleSignMultipleTransactions}
            shouldDisplaySpinner={isRequestPending}
            isDisabled={isRequestPending}
          >
            {isRequestPending ? "Loading..." : "Sign Group"}
          </Button>
        </div>
      )}

      <div className={"app__logs"}>
        {logs.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`log-${index}`} className={"app__log"}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );

  // This is just a demonstration of how to use opt-in txns, it doesn't send to the network
  async function handleOptinAsset() {
    setIsRequestPending(true);

    const txGroups = await generateOptIntoAssetTxns({
      assetID: 10458941,
      initiatorAddr: accountAddress!
    });

    handleSetLog("Opt-in txns generated: Launch Pera Wallet to sign them");

    try {
      await peraWallet.signTransaction([txGroups]);

      handleSetLog("Opt-in txns signed successfully!");
    } catch (error) {
      handleSetLog("Couldn't sign Opt-in txns");
    } finally {
      setIsRequestPending(false);
    }
  }

  async function handleSignPaymentTransaction() {
    setIsRequestPending(true);

    const txGroups = await generatePaymentTxns({
      to: "GD64YIY3TWGDMCNPP553DZPPR6LDUSFQOIJVFDPPXWEG3FVOJCCDBBHU5A",
      initiatorAddr: accountAddress!
    });

    handleSetLog("Payment txns generated: Launch Pera Wallet to sign them");

    try {
      const signedTxnGroup = await peraWallet.signTransaction([txGroups]);

      const { txId } = await algod.sendRawTransaction(signedTxnGroup).do();

      handleSetLog(`Payment txns signed successfully! - txID: ${txId}`);
    } catch (error) {
      handleSetLog(`${error}`);
    } finally {
      setIsRequestPending(false);
    }
  }

  async function handleSignAssetTransferTransaction() {
    setIsRequestPending(true);

    const txGroups = await generateAssetTransferTxns({
      to: "GD64YIY3TWGDMCNPP553DZPPR6LDUSFQOIJVFDPPXWEG3FVOJCCDBBHU5A",
      assetID: 10458941,
      initiatorAddr: accountAddress!
    });

    handleSetLog("Transfer txns generated: Launch Pera Wallet to sign them");

    try {
      const signedTxnGroup = await peraWallet.signTransaction([txGroups]);

      console.log(signedTxnGroup);

      const { txId } = await algod.sendRawTransaction(signedTxnGroup).do();

      handleSetLog(`Transfer txns signed successfully! - txID: ${txId}`);
    } catch (error) {
      handleSetLog(`${error}`);
    } finally {
      setIsRequestPending(false);
    }
  }

  async function handleSignMultipleTransactions() {
    setIsRequestPending(true);

    const optinTxGroups = await generateOptIntoAssetTxns({
      assetID: 10458941,
      initiatorAddr: accountAddress!
    });
    const transferTxGroups = await generateAssetTransferTxns({
      to: "GD64YIY3TWGDMCNPP553DZPPR6LDUSFQOIJVFDPPXWEG3FVOJCCDBBHU5A",
      assetID: 10458941,
      initiatorAddr: accountAddress!
    });

    handleSetLog("Transfer txns generated: Launch Pera Wallet to sign them");

    try {
      const signedTxnGroups = await peraWallet.signTransaction([
        optinTxGroups,
        transferTxGroups
      ]);

      console.log(signedTxnGroups);

      // Sign every txn in the group
      for (const signedTxnGroup of signedTxnGroups) {
        const { txId } = await algod.sendRawTransaction(signedTxnGroup).do();

        handleSetLog(`txns signed successfully! - txID: ${txId}`);
      }
    } catch (error) {
      handleSetLog(`${error}`);
    } finally {
      setIsRequestPending(false);
    }
  }

  async function handleConnectWalletClick() {
    try {
      const newAccounts = await peraWallet.connect();

      setAccountAddress(newAccounts[0]);
    } catch (e) {
      if (e?.data?.type !== "CONNECT_MODAL_CLOSED") {
        console.log(e);
      }
    }
  }

  function handleDisconnectWalletClick() {
    peraWallet.disconnect();

    setAccountAddress(null);
  }

  function handleSetLog(log: string) {
    setLogs((prevState) => [log, ...prevState]);
  }
}

export default App;
