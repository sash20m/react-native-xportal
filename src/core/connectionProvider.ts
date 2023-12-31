import { WalletConnectProvider } from '../services/wallet/walletConnectProvider';

// The main provider with the main functions
let walletConnectProvider: WalletConnectProvider;

const setWalletConnectProvider = (provider: WalletConnectProvider): void => {
  walletConnectProvider = provider;
};

const reassignWalletConnectProvider = (provider: WalletConnectProvider): void => {
  Object.assign(walletConnectProvider, provider);
};

const getWalletConnectProvider = (): WalletConnectProvider => {
  return walletConnectProvider;
};

const resetWalletConnectProvider = (): void => {
  walletConnectProvider = {} as WalletConnectProvider;
};

export {
  walletConnectProvider,
  setWalletConnectProvider,
  reassignWalletConnectProvider,
  getWalletConnectProvider,
  resetWalletConnectProvider,
};
