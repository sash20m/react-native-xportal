import {ConnectionProvider} from './types/connectionProvider.types';
import {emptyProvider} from './xportal/emptyWalletConnectProvider';
import {WalletConnectProvider} from './xportal/walletConnectProvider';

let walletConnectProvider: ConnectionProvider | WalletConnectProvider =
  emptyProvider as ConnectionProvider;

const setWalletConnectProvider = (provider: WalletConnectProvider) => {
  walletConnectProvider = provider;
};

const getWalletConnectProvider = ():
  | WalletConnectProvider
  | ConnectionProvider => {
  return walletConnectProvider;
};

export {
  walletConnectProvider,
  setWalletConnectProvider,
  getWalletConnectProvider,
};
