import {WalletConnectProvider} from '../services/walletConnectProvider/walletConnectProvider';

// The main provider with the main functions
let walletConnectProvider: WalletConnectProvider;

const setWalletConnectProvider = (provider: WalletConnectProvider): void => {
  walletConnectProvider = provider;
};

const reassignWalletConnectProvider = (
  provider: WalletConnectProvider,
): void => {
  Object.assign(walletConnectProvider, provider);
};

const getWalletConnectProvider = (): WalletConnectProvider => {
  return walletConnectProvider;
};

export {
  walletConnectProvider,
  setWalletConnectProvider,
  reassignWalletConnectProvider,
  getWalletConnectProvider,
};
