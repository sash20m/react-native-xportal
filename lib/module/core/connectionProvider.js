// The main provider with the main functions
let walletConnectProvider;
const setWalletConnectProvider = provider => {
  walletConnectProvider = provider;
};
const reassignWalletConnectProvider = provider => {
  Object.assign(walletConnectProvider, provider);
};
const getWalletConnectProvider = () => {
  return walletConnectProvider;
};
const resetWalletConnectProvider = () => {
  walletConnectProvider = {};
};
export { walletConnectProvider, setWalletConnectProvider, reassignWalletConnectProvider, getWalletConnectProvider, resetWalletConnectProvider };
//# sourceMappingURL=connectionProvider.js.map