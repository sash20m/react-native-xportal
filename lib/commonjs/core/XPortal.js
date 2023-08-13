"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.xPortalSingleton = void 0;
var _connectionConfig = require("../redux/slices/connectionConfig.slice");
var _wallet = require("../redux/slices/wallet.slice");
var _store = require("../redux/store");
var _walletConnectProvider = require("../services/wallet/walletConnectProvider");
var _connectionProvider = require("./connectionProvider");
var _commonActions = require("../redux/commonActions");
var _http = _interopRequireDefault(require("../services/http"));
var _openXPortal = require("../utils/openXPortal");
var _sdkCore = require("@multiversx/sdk-core");
var _utils = require("../services/wallet/utils");
var _gas = require("../constants/gas");
var _bignumber = _interopRequireDefault(require("bignumber.js"));
var _stringsUtils = require("../utils/stringsUtils");
var _wallet2 = require("../redux/selectors/wallet.selector");
var _connectionConfig2 = require("../redux/selectors/connectionConfig.selector");
var _out = require("@multiversx/sdk-network-providers/out");
var _urls = require("../constants/urls");
var _errorMessages = require("../constants/errorMessages");
var _initializeParamsValidator = require("../utils/validators/initializeParamsValidator");
var _errorComposer = require("../utils/errorComposer");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class XPortal {
  relayUrl = 'wss://relay.walletconnect.com';
  constructor() {}
  getWalletAddress() {
    const walletConnectProvider = (0, _connectionProvider.getWalletConnectProvider)();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(_errorMessages.ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    const address = (0, _wallet2.selectWalletAddress)();
    if (!address) {
      return null;
    }
    return address;
  }
  isConnected() {
    const state = (0, _connectionConfig2.selectConnectedState)();
    return !!state;
  }
  getFullAccountInfo() {
    const walletConnectProvider = (0, _connectionProvider.getWalletConnectProvider)();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(_errorMessages.ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    const account = (0, _wallet2.selectAccount)();
    return account;
  }
  getAccountTokensList() {
    const walletConnectProvider = (0, _connectionProvider.getWalletConnectProvider)();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(_errorMessages.ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    const tokens = (0, _wallet2.selectAccountTokens)();
    return tokens;
  }
  getAccountBalance() {
    const walletConnectProvider = (0, _connectionProvider.getWalletConnectProvider)();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(_errorMessages.ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    const balance = (0, _wallet2.selectAccountBalance)();
    return balance;
  }
  async initialize(_ref) {
    let {
      chainId,
      projectId,
      metadata,
      callbacks
    } = _ref;
    if (!(0, _initializeParamsValidator.validateInitParams)({
      chainId,
      projectId,
      metadata,
      callbacks
    })) {
      throw new Error(_errorMessages.ERROR_MESSAGES.MISSING_INIT_PARAMS);
    }
    try {
      await _store.store.dispatch((0, _connectionConfig.updateConnectionConfig)({
        chainId,
        projectId
      }));
      const options = metadata ? {
        metadata
      } : {};
      const connectionProvider = new _walletConnectProvider.WalletConnectProvider(this.enrichCallbacks(callbacks), chainId, this.relayUrl, projectId, options);
      await connectionProvider.init();
      (0, _connectionProvider.setWalletConnectProvider)(connectionProvider);
      return true;
    } catch (error) {
      throw new Error((0, _errorComposer.errorComposer)({
        message: _errorMessages.ERROR_MESSAGES.INIT_FAILED,
        data: error
      }));
    }
  }
  async login() {
    const walletConnectProvider = (0, _connectionProvider.getWalletConnectProvider)();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector) && !walletConnectProvider.wasConnected) {
      throw new Error(_errorMessages.ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    if (walletConnectProvider.wasConnected) {
      await walletConnectProvider.reinitialize();
    }
    try {
      const {
        uri: connectorUri,
        approval
      } = await walletConnectProvider.connect();
      (0, _openXPortal.openXPortalForLogin)(connectorUri);
      await _store.store.dispatch((0, _connectionConfig.updateAccountLoading)({
        isAccountLoading: true
      }));
      await walletConnectProvider.login({
        approval
      });
      const tokens = await _http.default.getAccountTokens(walletConnectProvider.address);
      const account = await _http.default.getMxAccount(walletConnectProvider.address);
      await _store.store.dispatch((0, _commonActions.setConnectionOnLogin)({
        address: walletConnectProvider.address,
        tokens,
        walletConnectSession: walletConnectProvider.session,
        ...account
      }));
      (0, _connectionProvider.setWalletConnectProvider)(walletConnectProvider);
      return true;
    } catch (error) {
      throw new Error((0, _errorComposer.errorComposer)({
        message: _errorMessages.ERROR_MESSAGES.LOGIN_FAILED,
        data: error
      }));
    }
  }
  async logout() {
    const walletConnectProvider = (0, _connectionProvider.getWalletConnectProvider)();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(_errorMessages.ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    try {
      await _store.store.dispatch((0, _commonActions.resetOnLogout)());
      await walletConnectProvider.logout();
      return true;
    } catch (error) {
      throw new Error((0, _errorComposer.errorComposer)({
        message: _errorMessages.ERROR_MESSAGES.LOGIN_FAILED,
        data: error
      }));
    }
  }
  async signTransactions(_ref2) {
    let {
      transactions,
      minGasLimit = _gas.GAS_LIMIT
    } = _ref2;
    const walletConnectProvider = (0, _connectionProvider.getWalletConnectProvider)();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(_errorMessages.ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    try {
      const transactionsPayload = Array.isArray(transactions) ? transactions : [transactions];
      const areComplexTransactions = transactionsPayload.every(tx => Object.getPrototypeOf(tx).toPlainObject != null);
      let txToSign = transactionsPayload;
      const hasNonces = txToSign.every(tx => 'nonce' in tx);
      if (!hasNonces) {
        throw new Error(_errorMessages.ERROR_MESSAGES.TX_WITHOUT_NONCE);
      }
      if (!areComplexTransactions) {
        txToSign = await (0, _utils.createSignableTransactions)(transactions);
      }
      const accountBalance = (0, _wallet2.selectWalletBalance)() || 0;
      const bNtotalFee = (0, _utils.calcTotalFee)(txToSign, minGasLimit);
      const bNbalance = new _bignumber.default((0, _stringsUtils.stringIsFloat)(String(accountBalance)) ? accountBalance : '0');
      const hasSufficientFunds = bNbalance.minus(bNtotalFee).isGreaterThan(0);
      if (!hasSufficientFunds) {
        throw new Error(_errorMessages.ERROR_MESSAGES.INSUFFICIENT_FUNDS);
      }
      try {
        (0, _openXPortal.openXPortal)();
      } catch (error) {
        console.warn('Sign Transaction in xPortal wallet');
      }
      try {
        const signedTransaction = await walletConnectProvider.signTransactions(txToSign);
        return signedTransaction;
      } catch (error) {
        throw new Error((0, _errorComposer.errorComposer)({
          message: _errorMessages.ERROR_MESSAGES.SIGN_TX_FAILED,
          data: error
        }));
      }
    } catch (error) {
      throw new Error((0, _errorComposer.errorComposer)({
        message: _errorMessages.ERROR_MESSAGES.SIGN_TX_PREPARATION_FAILED,
        data: error
      }));
    }
  }
  async signMessage(_ref3) {
    let {
      message
    } = _ref3;
    const walletConnectProvider = (0, _connectionProvider.getWalletConnectProvider)();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(_errorMessages.ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    if (!message || typeof message !== 'string') {
      throw new Error(_errorMessages.ERROR_MESSAGES.MESSAGE_INVALID);
    }
    try {
      const address = (0, _wallet2.selectWalletAddress)();
      const signableMessage = new _sdkCore.SignableMessage({
        address: new _sdkCore.Address(address),
        message: Buffer.from(message, 'ascii')
      });
      try {
        (0, _openXPortal.openXPortal)();
      } catch (error) {
        console.warn('Sign Transaction in xPortal wallet');
      }
      const signedMessage = await walletConnectProvider.signMessage(signableMessage);
      return signedMessage;
    } catch (error) {
      throw new Error((0, _errorComposer.errorComposer)({
        message: _errorMessages.ERROR_MESSAGES.SIGN_MESSAGE_FAILED,
        data: error
      }));
    }
  }
  async sendCustomRequest(_ref4) {
    let {
      request
    } = _ref4;
    const walletConnectProvider = (0, _connectionProvider.getWalletConnectProvider)();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(_errorMessages.ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    if (!request.method) {
      throw new Error(_errorMessages.ERROR_MESSAGES.RQ_METHOD_INVALID);
    }
    try {
      try {
        (0, _openXPortal.openXPortal)();
      } catch (error) {
        console.warn('Sign Transaction in xPortal wallet');
      }
      const response = await walletConnectProvider.sendCustomRequest({
        request
      });
      return response;
    } catch (error) {
      throw new Error((0, _errorComposer.errorComposer)({
        message: _errorMessages.ERROR_MESSAGES.CUSTOM_RQ_FAILED,
        data: error
      }));
    }
  }
  async ping() {
    const walletConnectProvider = (0, _connectionProvider.getWalletConnectProvider)();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(_errorMessages.ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    try {
      const response = await (walletConnectProvider === null || walletConnectProvider === void 0 ? void 0 : walletConnectProvider.ping());
      return response;
    } catch (error) {
      throw new Error((0, _errorComposer.errorComposer)({
        message: _errorMessages.ERROR_MESSAGES.FAILED_PING,
        data: error
      }));
    }
  }
  async refreshAccountData() {
    const walletConnectProvider = (0, _connectionProvider.getWalletConnectProvider)();
    if (!(walletConnectProvider !== null && walletConnectProvider !== void 0 && walletConnectProvider.walletConnector)) {
      throw new Error(_errorMessages.ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    try {
      const tokens = await _http.default.getAccountTokens(walletConnectProvider.address);
      const account = await _http.default.getMxAccount(walletConnectProvider.address);
      await _store.store.dispatch((0, _wallet.updateWallet)({
        tokens,
        ...account
      }));
      return {
        tokens,
        ...account
      };
    } catch (error) {
      throw new Error((0, _errorComposer.errorComposer)({
        message: _errorMessages.ERROR_MESSAGES.FAILED_REFRESH_ACCOUNT,
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
    const provider = new _out.ProxyNetworkProvider(_urls.URLS.MULTIVERSX_GATEWAY);
    const transaction = {
      getHash: () => ({
        hex: () => transactionHash
      })
    };
    try {
      const watcher = new _sdkCore.TransactionWatcher(provider, {
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
      throw new Error((0, _errorComposer.errorComposer)({
        message: _errorMessages.ERROR_MESSAGES.WATCHER_ERROR,
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
        await _store.store.dispatch((0, _commonActions.resetOnLogout)());
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
const xPortalSingleton = new XPortal();
exports.xPortalSingleton = xPortalSingleton;
//# sourceMappingURL=XPortal.js.map