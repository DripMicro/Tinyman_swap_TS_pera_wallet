import {SignerTransaction} from "@perawallet/connect/dist/util/model/peraWalletModels";
import algosdk from "algosdk";

import algod from "./algod";

async function generateOptIntoAssetTxns({
  assetID,
  initiatorAddr
}: {
  assetID: number;
  initiatorAddr: string;
}): Promise<SignerTransaction[]> {
  const suggestedParams = await algod.getTransactionParams().do();
  const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: initiatorAddr,
    to: initiatorAddr,
    assetIndex: assetID,
    amount: 0,
    suggestedParams
  });

  return [{txn: optInTxn, signers: [initiatorAddr]}];
}

async function generatePaymentTxns({
  to,
  initiatorAddr
}: {
  to: string;
  initiatorAddr: string;
}) {
  const suggestedParams = await algod.getTransactionParams().do();

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: initiatorAddr,
    to,
    amount: 1,
    suggestedParams
  });

  return [{txn, signers: [initiatorAddr]}];
}

async function generateAssetTransferTxns({
  to,
  assetID,
  initiatorAddr
}: {
  to: string;
  assetID: number;
  initiatorAddr: string;
}) {
  const suggestedParams = await algod.getTransactionParams().do();

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: initiatorAddr,
    to,
    assetIndex: assetID,
    amount: 1,
    suggestedParams
  });

  return [{txn, signers: [initiatorAddr]}];
}

export {generateOptIntoAssetTxns, generatePaymentTxns, generateAssetTransferTxns};
