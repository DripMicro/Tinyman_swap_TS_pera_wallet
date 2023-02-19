import algosdk from "algosdk";

const algod = new algosdk.Algodv2(
  "",
  "https://node.testnet.algoexplorerapi.io/",
  // eslint-disable-next-line no-magic-numbers
  443
);

export default algod;
