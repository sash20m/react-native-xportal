import { updateAccountLoading, updateConnectionConfig } from '../redux/slices/connectionConfig.slice';
import { updateWallet } from '../redux/slices/wallet.slice';
import { store as reduxStore } from '../redux/store';
import { WalletConnectProvider } from '../services/wallet/walletConnectProvider';
import { getWalletConnectProvider, setWalletConnectProvider } from './connectionProvider';
import { resetOnLogout, setConnectionOnLogin } from '../redux/commonActions';
import http from '../services/http';
import { openXPortal, openXPortalForLogin } from '../utils/openXPortal';
import { Address, SignableMessage, TransactionWatcher } from '@multiversx/sdk-core';
import { calcTotalFee, createSignableTransactions } from '../services/wallet/utils';
import { GAS_LIMIT } from '../constants/gas';
import BigNumber from 'bignumber.js';
import { stringIsFloat } from '../utils/stringsUtils';
import { selectAccount, selectAccountBalance, selectAccountTokens, selectWalletAddress, selectWalletBalance } from '../redux/selectors/wallet.selector';
import { selectConnectedState } from '../redux/selectors/connectionConfig.selector';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers/out';
import { URLS } from '../constants/urls';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import { validateInitParams } from '../utils/validators/initializeParamsValidator';
import { errorComposer } from '../utils/errorComposer';
class XPortal {
  relayUrl = 'wss://relay.walletconnect.com';
  constructor() {}
  getWalletAddress() {
    const walletConnectProvider = getWalletConnectProvider();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    const address = selectWalletAddress();
    if (!address) {
      return null;
    }
    return address;
  }
  isConnected() {
    const state = selectConnectedState();
    return !!state;
  }
  getFullAccountInfo() {
    const walletConnectProvider = getWalletConnectProvider();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    const account = selectAccount();
    return account;
  }
  getAccountTokensList() {
    const walletConnectProvider = getWalletConnectProvider();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    const tokens = selectAccountTokens();
    const generalBalance = selectAccountBalance();
    return {
      balance: generalBalance,
      tokens
    };
  }
  getAccountBalance() {
    const walletConnectProvider = getWalletConnectProvider();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    const balance = selectAccountBalance();
    return balance;
  }
  async initialize(_ref) {
    let {
      chainId,
      projectId,
      metadata,
      callbacks
    } = _ref;
    if (!validateInitParams({
      chainId,
      projectId,
      metadata,
      callbacks
    })) {
      throw new Error(ERROR_MESSAGES.MISSING_INIT_PARAMS);
    }
    try {
      await reduxStore.dispatch(updateConnectionConfig({
        chainId,
        projectId
      }));
      const options = metadata ? {
        metadata
      } : {};
      const connectionProvider = new WalletConnectProvider(this.enrichCallbacks(callbacks), chainId, this.relayUrl, projectId, options);
      await connectionProvider.init();
      setWalletConnectProvider(connectionProvider);
      return true;
    } catch (error) {
      throw new Error(errorComposer({
        message: ERROR_MESSAGES.INIT_FAILED,
        data: error
      }));
    }
  }
  async login() {
    const walletConnectProvider = getWalletConnectProvider();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector) && !walletConnectProvider.wasConnected) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    if (walletConnectProvider.wasConnected) {
      await walletConnectProvider.reinitialize();
    }
    try {
      const {
        uri: connectorUri,
        approval
      } = await walletConnectProvider.connect();
      openXPortalForLogin(connectorUri);
      await reduxStore.dispatch(updateAccountLoading({
        isAccountLoading: true
      }));
      await walletConnectProvider.login({
        approval
      });
      const tokens = await http.getAccountTokens(walletConnectProvider.address);
      const account = await http.getMxAccount(walletConnectProvider.address);
      await reduxStore.dispatch(setConnectionOnLogin({
        address: walletConnectProvider.address,
        tokens,
        walletConnectSession: walletConnectProvider.session,
        ...account
      }));
      setWalletConnectProvider(walletConnectProvider);
      return true;
    } catch (error) {
      throw new Error(errorComposer({
        message: ERROR_MESSAGES.LOGIN_FAILED,
        data: error
      }));
    }
  }
  async logout() {
    const walletConnectProvider = getWalletConnectProvider();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    try {
      await reduxStore.dispatch(resetOnLogout());
      await walletConnectProvider.logout();
      return true;
    } catch (error) {
      throw new Error(errorComposer({
        message: ERROR_MESSAGES.LOGIN_FAILED,
        data: error
      }));
    }
  }
  async signTransactions(_ref2) {
    let {
      transactions,
      minGasLimit = GAS_LIMIT
    } = _ref2;
    const walletConnectProvider = getWalletConnectProvider();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    try {
      const transactionsPayload = Array.isArray(transactions) ? transactions : [transactions];
      const areComplexTransactions = transactionsPayload.every(tx => Object.getPrototypeOf(tx).toPlainObject != null);
      let txToSign = transactionsPayload;
      if (!areComplexTransactions) {
        txToSign = await createSignableTransactions(transactions);
      }
      const accountBalance = selectWalletBalance() || 0;
      const bNtotalFee = calcTotalFee(txToSign, minGasLimit);
      const bNbalance = new BigNumber(stringIsFloat(String(accountBalance)) ? accountBalance : '0');
      const hasSufficientFunds = bNbalance.minus(bNtotalFee).isGreaterThan(0);
      if (!hasSufficientFunds) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_FUNDS);
      }
      try {
        openXPortal();
      } catch (error) {
        console.warn('Sign Transaction in xPortal wallet');
      }
      try {
        const signedTransaction = await walletConnectProvider.signTransactions(txToSign);
        return signedTransaction;
      } catch (error) {
        throw new Error(errorComposer({
          message: ERROR_MESSAGES.SIGN_TX_FAILED,
          data: error
        }));
      }
    } catch (error) {
      throw new Error(errorComposer({
        message: ERROR_MESSAGES.SIGN_TX_PREPARATION_FAILED,
        data: error
      }));
    }
  }
  async signMessage(_ref3) {
    let {
      message
    } = _ref3;
    const walletConnectProvider = getWalletConnectProvider();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    if (!message || typeof message !== 'string') {
      throw new Error(ERROR_MESSAGES.MESSAGE_INVALID);
    }
    try {
      const address = selectWalletAddress();
      const signableMessage = new SignableMessage({
        address: new Address(address),
        message: Buffer.from(message, 'ascii')
      });
      try {
        openXPortal();
      } catch (error) {
        console.warn('Sign Transaction in xPortal wallet');
      }
      const signedMessage = await walletConnectProvider.signMessage(signableMessage);
      return signedMessage;
    } catch (error) {
      throw new Error(errorComposer({
        message: ERROR_MESSAGES.SIGN_MESSAGE_FAILED,
        data: error
      }));
    }
  }
  async sendCustomRequest(_ref4) {
    let {
      request
    } = _ref4;
    const walletConnectProvider = getWalletConnectProvider();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    if (!request.method) {
      throw new Error(ERROR_MESSAGES.RQ_METHOD_INVALID);
    }
    try {
      try {
        openXPortal();
      } catch (error) {
        console.warn('Sign Transaction in xPortal wallet');
      }
      const response = await walletConnectProvider.sendCustomRequest({
        request
      });
      return response;
    } catch (error) {
      throw new Error(errorComposer({
        message: ERROR_MESSAGES.CUSTOM_RQ_FAILED,
        data: error
      }));
    }
  }
  async ping() {
    const walletConnectProvider = getWalletConnectProvider();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    try {
      const response = await (walletConnectProvider === null || walletConnectProvider === void 0 ? void 0 : walletConnectProvider.ping());
      return response;
    } catch (error) {
      throw new Error(errorComposer({
        message: ERROR_MESSAGES.FAILED_PING,
        data: error
      }));
    }
  }
  async refreshAccountData() {
    const walletConnectProvider = getWalletConnectProvider();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    try {
      const tokens = await http.getAccountTokens(walletConnectProvider.address);
      const account = await http.getMxAccount(walletConnectProvider.address);
      await reduxStore.dispatch(updateWallet({
        tokens,
        ...account
      }));
      return {
        tokens,
        ...account
      };
    } catch (error) {
      throw new Error(errorComposer({
        message: ERROR_MESSAGES.FAILED_REFRESH_ACCOUNT,
        data: error
      }));
    }
  }
  async watchTransaction(_ref5) {
    let {
      transactionHash,
      withUpdateAccountData,
      pollingIntervalMilliseconds = 1000,
      timeoutMilliseconds = 180000
    } = _ref5;
    const provider = new ProxyNetworkProvider(URLS.MULTIVERSX_GATEWAY);
    const transaction = {
      getHash: () => ({
        hex: () => transactionHash
      })
    };
    try {
      const watcher = new TransactionWatcher(provider, {
        pollingIntervalMilliseconds,
        timeoutMilliseconds
      });
      const res = await watcher.awaitCompleted(transaction);
      if (res.status.isFailed()) {
        throw new Error('Transaction failed');
      }
      if (withUpdateAccountData) {
        await this.refreshAccountData();
      }
      return res.status;
    } catch (error) {
      throw new Error(errorComposer({
        message: ERROR_MESSAGES.WATCHER_ERROR,
        data: error
      }));
    }
  }
  enrichCallbacks(callbacks) {
    const newCallbacks = {
      onClientLogin: () => {
        // some future needed code on login
        // ...

        callbacks.onClientLogin();
      },
      onClientLogout: async () => {
        await reduxStore.dispatch(resetOnLogout());
        callbacks.onClientLogout();
      },
      onClientEvent: event => {
        // some future needed code on event
        // ...

        callbacks.onClientEvent(event);
      }
    };
    return newCallbacks;
  }
}
export const xPortalSingleton = new XPortal();
//# sourceMappingURL=XPortal.js.map