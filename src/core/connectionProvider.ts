import {WalletConnectProvider} from './walletConnectProvider/walletConnectProvider';

// The main provider with the main functions
let walletConnectProvider: WalletConnectProvider;

const setWalletConnectProvider = (provider: WalletConnectProvider): void => {
  walletConnectProvider = provider;
};

const getWalletConnectProvider = (): WalletConnectProvider => {
  return walletConnectProvider;
};

export {
  walletConnectProvider,
  setWalletConnectProvider,
  getWalletConnectProvider,
};
