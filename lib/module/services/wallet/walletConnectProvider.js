import { Signature } from '@multiversx/sdk-core/out/signature';
import Client from '@walletconnect/sign-client';
import { getSdkError, isValidArray } from '@walletconnect/utils';
import { WALLETCONNECT_MULTIVERSX_NAMESPACE } from './constants';
import { WalletConnectProviderErrorMessagesEnum } from './errors';
import { Logger } from './logger';
import { Operation, OptionalOperation } from './operation';
import { applyTransactionSignature, addressIsValid, getCurrentSession, getCurrentTopic, getAddressFromSession, getConnectionParams } from './utils';
import { reassignWalletConnectProvider } from '../../core/connectionProvider';
export class WalletConnectProvider {
  chainId = '';
  address = '';
  signature = '';
  isInitializing = false;
  processingTopic = '';
  options = {};
  wasConnected = false;
  constructor(onClientConnect, chainId, walletConnectRelay, walletConnectProjectId, options) {
    this.onClientConnect = onClientConnect;
    this.chainId = chainId;
    this.walletConnectRelay = walletConnectRelay;
    this.walletConnectProjectId = walletConnectProjectId;
    this.options = options;
  }
  reset() {
    this.address = '';
    this.signature = '';
    this.walletConnector = undefined;
    this.session = undefined;
    this.pairings = undefined;
  }

  /**
   * Initiates WalletConnect client.
   */
  async init() {
    if (this.isInitialized()) {
      return this.isInitialized();
    } else {
      try {
        if (!this.isInitializing) {
          this.isInitializing = true;
          this.reset();
          const client = await Client.init({
            relayUrl: this.walletConnectRelay,
            projectId: this.walletConnectProjectId,
            ...this.options
          });
          this.walletConnector = client;
          this.isInitializing = false;
          await this.subscribeToEvents(client);
          await this.checkPersistedState(client);
        }
      } catch (error) {
        throw new Error(WalletConnectProviderErrorMessagesEnum.unableToInit);
      } finally {
        this.isInitializing = false;
        return this.isInitialized();
      }
    }
  }
  async reinitialize() {
    var _this$options;
    const options = (_this$options = this.options) !== null && _this$options !== void 0 && _this$options.metadata ? {
      metadata: this.options.metadata
    } : {};
    if (!(this.onClientConnect && this.chainId && this.walletConnectRelay && this.walletConnectProjectId && !!options.metadata)) {
      return false;
    }
    const connectionProvider = new WalletConnectProvider(this.onClientConnect, this.chainId, this.walletConnectRelay, this.walletConnectProjectId, options);
    await connectionProvider.init();
    Object.assign(this, connectionProvider);
    reassignWalletConnectProvider(connectionProvider);
    return true;
  }

  /**
   * Returns true if init() was previously called successfully
   */
  isInitialized() {
    return !!this.walletConnector && !this.isInitializing;
  }

  /**
   * Returns true if provider is initialized and a valid session is set
   */
  isConnected() {
    return new Promise((resolve, _) => resolve(Boolean(this.isInitialized() && typeof this.session !== 'undefined')));
  }
  async connect(options) {
    if (typeof this.walletConnector === 'undefined') {
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }
    const connectParams = getConnectionParams(this.chainId, options);
    try {
      var _this$walletConnector;
      const response = await (this === null || this === void 0 || (_this$walletConnector = this.walletConnector) === null || _this$walletConnector === void 0 ? void 0 : _this$walletConnector.connect({
        pairingTopic: options === null || options === void 0 ? void 0 : options.topic,
        ...connectParams
      }));
      return response;
    } catch (error) {
      this.reset();
      Logger.error(options !== null && options !== void 0 && options.topic ? WalletConnectProviderErrorMessagesEnum.unableToConnectExisting : WalletConnectProviderErrorMessagesEnum.unableToConnect);
      throw new Error(options !== null && options !== void 0 && options.topic ? WalletConnectProviderErrorMessagesEnum.unableToConnectExisting : WalletConnectProviderErrorMessagesEnum.unableToConnect);
    }
  }
  async login(options) {
    this.isInitializing = true;
    if (typeof this.walletConnector === 'undefined') {
      await this.connect();
    }
    if (typeof this.walletConnector === 'undefined') {
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }
    if (typeof this.session !== 'undefined') {
      var _this$session;
      await this.logout({
        topic: (_this$session = this.session) === null || _this$session === void 0 ? void 0 : _this$session.topic
      });
    }
    this.wasConnected = true;
    try {
      if (options && options.approval) {
        const session = await options.approval();
        if (options.token) {
          const address = getAddressFromSession(session);
          const selectedNamespace = session.namespaces[WALLETCONNECT_MULTIVERSX_NAMESPACE];
          const method = selectedNamespace.methods.includes(OptionalOperation.SIGN_NATIVE_AUTH_TOKEN) ? OptionalOperation.SIGN_NATIVE_AUTH_TOKEN : OptionalOperation.SIGN_LOGIN_TOKEN;
          const {
            signature
          } = await this.walletConnector.request({
            chainId: `${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${this.chainId}`,
            topic: session.topic,
            request: {
              method,
              params: {
                token: options.token,
                address
              }
            }
          });
          if (!signature) {
            Logger.error(WalletConnectProviderErrorMessagesEnum.unableToSignLoginToken);
            throw new Error(WalletConnectProviderErrorMessagesEnum.unableToSignLoginToken);
          }
          return await this.onSessionConnected({
            session,
            signature
          });
        }
        return await this.onSessionConnected({
          session,
          signature: ''
        });
      }
    } catch (error) {
      this.reset();
      this.wasConnected = false;
      Logger.error(WalletConnectProviderErrorMessagesEnum.unableToLogin);
      throw new Error(WalletConnectProviderErrorMessagesEnum.unableToLogin);
    } finally {
      this.isInitializing = false;
    }
    return '';
  }

  /**
   * Mocks a logout request by returning true
   */
  async logout(options) {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }
    try {
      if (this.processingTopic === ((options === null || options === void 0 ? void 0 : options.topic) || getCurrentTopic(this.chainId, this.walletConnector))) {
        return true;
      }
      if (options !== null && options !== void 0 && options.topic) {
        this.processingTopic = options.topic;
        await this.walletConnector.disconnect({
          topic: options.topic,
          reason: getSdkError('USER_DISCONNECTED')
        });
      } else {
        const currentSessionTopic = getCurrentTopic(this.chainId, this.walletConnector);
        this.processingTopic = currentSessionTopic;
        await this.walletConnector.disconnect({
          topic: currentSessionTopic,
          reason: getSdkError('USER_DISCONNECTED')
        });
        this.reset();
        await this.cleanupPendingPairings({
          deletePairings: true
        });
      }
    } catch {
      Logger.error(WalletConnectProviderErrorMessagesEnum.alreadyLoggedOut);
    } finally {
      this.processingTopic = '';
    }
    return true;
  }

  /**
   * Fetches the WalletConnect address
   */
  async getAddress() {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }
    return this.address;
  }

  /**
   * Fetches the WalletConnect signature
   */
  async getSignature() {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }
    return this.signature;
  }

  /**
   * Fetches the WalletConnect pairings
   */
  async getPairings() {
    var _this$walletConnector2;
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }
    return ((_this$walletConnector2 = this.walletConnector) === null || _this$walletConnector2 === void 0 || (_this$walletConnector2 = _this$walletConnector2.core) === null || _this$walletConnector2 === void 0 || (_this$walletConnector2 = _this$walletConnector2.pairing) === null || _this$walletConnector2 === void 0 || (_this$walletConnector2 = _this$walletConnector2.pairings) === null || _this$walletConnector2 === void 0 ? void 0 : _this$walletConnector2.getAll({
      active: true
    })) ?? [];
  }

  /**
   * Signs a message and returns it signed
   * @param message
   */
  async signMessage(message) {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }
    if (typeof this.session === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
      await this.onClientConnect.onClientLogout();
      throw new Error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
    }
    try {
      const address = await this.getAddress();
      const {
        signature
      } = await this.walletConnector.request({
        chainId: `${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${this.chainId}`,
        topic: getCurrentTopic(this.chainId, this.walletConnector),
        request: {
          method: Operation.SIGN_MESSAGE,
          params: {
            address,
            message: message.message.toString()
          }
        }
      });
      if (!signature) {
        Logger.error(WalletConnectProviderErrorMessagesEnum.invalidMessageResponse);
        throw new Error(WalletConnectProviderErrorMessagesEnum.invalidMessageResponse);
      }
      try {
        message.applySignature(new Signature(signature));
      } catch (error) {
        Logger.error(WalletConnectProviderErrorMessagesEnum.invalidMessageSignature);
        throw new Error(WalletConnectProviderErrorMessagesEnum.invalidMessageSignature);
      }
    } catch (error) {
      throw new Error(WalletConnectProviderErrorMessagesEnum.unableToSign);
    }
    return message;
  }

  /**
   * Signs a transaction and returns it signed
   * @param transaction
   */
  async signTransaction(transaction) {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }
    if (typeof this.session === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
      await this.onClientConnect.onClientLogout();
      throw new Error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
    }
    const plainTransaction = transaction.toPlainObject();
    if (this.chainId !== transaction.getChainID().valueOf()) {
      Logger.error(WalletConnectProviderErrorMessagesEnum.requestDifferentChain);
      throw new Error(WalletConnectProviderErrorMessagesEnum.requestDifferentChain);
    }
    try {
      const response = await this.walletConnector.request({
        chainId: `${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${this.chainId}`,
        topic: getCurrentTopic(this.chainId, this.walletConnector),
        request: {
          method: Operation.SIGN_TRANSACTION,
          params: {
            transaction: plainTransaction
          }
        }
      });
      return applyTransactionSignature({
        transaction,
        response
      });
    } catch (error) {
      throw new Error(WalletConnectProviderErrorMessagesEnum.transactionError);
    }
  }

  /**
   * Signs an array of transactions and returns it signed
   * @param transactions
   */
  async signTransactions(transactions) {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }
    if (typeof this.session === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
      await this.onClientConnect.onClientLogout();
      throw new Error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
    }
    const plainTransactions = transactions.map(transaction => {
      if (this.chainId !== transaction.getChainID().valueOf()) {
        Logger.error(WalletConnectProviderErrorMessagesEnum.requestDifferentChain);
        throw new Error(WalletConnectProviderErrorMessagesEnum.requestDifferentChain);
      }
      return transaction.toPlainObject();
    });
    try {
      const {
        signatures
      } = await this.walletConnector.request({
        chainId: `${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${this.chainId}`,
        topic: getCurrentTopic(this.chainId, this.walletConnector),
        request: {
          method: Operation.SIGN_TRANSACTIONS,
          params: {
            transactions: plainTransactions
          }
        }
      });
      if (!signatures) {
        Logger.error(WalletConnectProviderErrorMessagesEnum.invalidTransactionResponse);
        throw new Error(WalletConnectProviderErrorMessagesEnum.invalidTransactionResponse);
      }
      if (!Array.isArray(signatures) || transactions.length !== signatures.length) {
        throw new Error(WalletConnectProviderErrorMessagesEnum.invalidTransactionResponse);
      }
      for (const [index, transaction] of transactions.entries()) {
        const response = signatures[index];
        applyTransactionSignature({
          transaction,
          response
        });
      }
      return transactions;
    } catch (error) {
      throw new Error(WalletConnectProviderErrorMessagesEnum.transactionError);
    }
  }

  /**
   * Sends a custom request
   * @param request
   */

  async sendCustomRequest(options) {
    var _options$request;
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }
    if (typeof this.session === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
      await this.onClientConnect.onClientLogout();
      throw new Error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
    }
    if (options !== null && options !== void 0 && (_options$request = options.request) !== null && _options$request !== void 0 && _options$request.method) {
      try {
        const request = {
          ...options.request
        };
        let {
          method
        } = request;
        const {
          response
        } = await this.walletConnector.request({
          chainId: `${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${this.chainId}`,
          topic: getCurrentTopic(this.chainId, this.walletConnector),
          request: {
            ...request,
            method
          }
        });
        if (!response) {
          Logger.error(WalletConnectProviderErrorMessagesEnum.invalidCustomRequestResponse);
        }
        return response;
      } catch (error) {
        Logger.error(WalletConnectProviderErrorMessagesEnum.invalidCustomRequestResponse);
      }
      return;
    }
  }

  /**
   * Ping helper
   */

  async ping() {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }
    if (typeof this.session === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
    }
    try {
      const topic = getCurrentTopic(this.chainId, this.walletConnector);
      await this.walletConnector.ping({
        topic
      });
      return true;
    } catch (error) {
      Logger.error(WalletConnectProviderErrorMessagesEnum.pingFailed);
      return false;
    }
  }
  async loginAccount(options) {
    if (!options) {
      return '';
    }
    if (addressIsValid(options.address)) {
      this.address = options.address;
      if (options.signature) {
        this.signature = options.signature;
      }
      await this.onClientConnect.onClientLogin();
      return this.address;
    }
    Logger.error(`${WalletConnectProviderErrorMessagesEnum.invalidAddress} ${options.address}`);
    if (this.walletConnector) {
      await this.logout();
    }
    return '';
  }
  async onSessionConnected(options) {
    if (!options) {
      return '';
    }
    this.session = options.session;
    this.wasConnected = true;
    const address = getAddressFromSession(options.session);
    if (address) {
      await this.loginAccount({
        address,
        signature: options.signature
      });
      return address;
    }
    return '';
  }
  async handleTopicUpdateEvent(_ref) {
    let {
      topic
    } = _ref;
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      return;
    }
    try {
      const existingPairings = await this.getPairings();
      if (this.address && !this.isInitializing && existingPairings) {
        if ((existingPairings === null || existingPairings === void 0 ? void 0 : existingPairings.length) === 0) {
          await this.onClientConnect.onClientLogout();
        } else {
          const lastActivePairing = existingPairings[existingPairings.length - 1];
          if ((lastActivePairing === null || lastActivePairing === void 0 ? void 0 : lastActivePairing.topic) === topic) {
            await this.onClientConnect.onClientLogout();
          }
        }
      }
    } catch (error) {
      Logger.error(WalletConnectProviderErrorMessagesEnum.unableToHandleTopic);
    } finally {
      this.pairings = await this.getPairings();
    }
  }
  async handleSessionEvents(_ref2) {
    var _this$session2;
    let {
      topic,
      params
    } = _ref2;
    if (typeof this.walletConnector === 'undefined') {
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }
    if (this.session && ((_this$session2 = this.session) === null || _this$session2 === void 0 ? void 0 : _this$session2.topic) !== topic) {
      return;
    }
    const {
      event
    } = params;
    if (event !== null && event !== void 0 && event.name && getCurrentTopic(this.chainId, this.walletConnector) === topic) {
      const eventData = event.data;
      await this.onClientConnect.onClientEvent(eventData);
    }
  }
  async subscribeToEvents(client) {
    if (typeof client === 'undefined') {
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }
    try {
      var _client$core, _client$core2;
      // Session Events
      client.on('session_update', _ref3 => {
        var _this$session3;
        let {
          topic,
          params
        } = _ref3;
        if (!this.session || ((_this$session3 = this.session) === null || _this$session3 === void 0 ? void 0 : _this$session3.topic) !== topic) {
          return;
        }
        const {
          namespaces
        } = params;
        const _session = client.session.get(topic);
        const updatedSession = {
          ..._session,
          namespaces
        };
        this.onSessionConnected({
          session: updatedSession
        });
      });
      client.on('session_event', this.handleSessionEvents.bind(this));
      client.on('session_delete', async _ref4 => {
        var _this$session4;
        let {
          topic
        } = _ref4;
        if (this.isInitializing) {
          await this.onClientConnect.onClientLogout();
          this.reset();
        }
        if (!this.session || ((_this$session4 = this.session) === null || _this$session4 === void 0 ? void 0 : _this$session4.topic) !== topic) {
          return;
        }
        Logger.error(WalletConnectProviderErrorMessagesEnum.sessionDeleted);
        await this.onClientConnect.onClientLogout();
        this.reset();
        await this.cleanupPendingPairings({
          deletePairings: true
        });
      });
      client.on('session_expire', async _ref5 => {
        var _this$session5;
        let {
          topic
        } = _ref5;
        if (!this.session || ((_this$session5 = this.session) === null || _this$session5 === void 0 ? void 0 : _this$session5.topic) !== topic) {
          return;
        }
        Logger.error(WalletConnectProviderErrorMessagesEnum.sessionExpired);
        await this.onClientConnect.onClientLogout();
        this.reset();
        await this.cleanupPendingPairings({
          deletePairings: true
        });
      });

      // Pairing Events
      (_client$core = client.core) === null || _client$core === void 0 || (_client$core = _client$core.pairing) === null || _client$core === void 0 ? void 0 : _client$core.events.on('pairing_delete', this.handleTopicUpdateEvent.bind(this));
      (_client$core2 = client.core) === null || _client$core2 === void 0 || (_client$core2 = _client$core2.pairing) === null || _client$core2 === void 0 ? void 0 : _client$core2.events.on('pairing_expire', this.handleTopicUpdateEvent.bind(this));
    } catch (error) {
      Logger.error(WalletConnectProviderErrorMessagesEnum.unableToHandleEvent);
    }
  }
  async checkPersistedState(client) {
    if (typeof client === 'undefined') {
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }
    this.pairings = await this.getPairings();
    if (typeof this.session !== 'undefined') {
      return;
    }

    // Populates existing session to state (assume only the top one)
    if (client.session.length && !this.address && !this.isInitializing) {
      const session = getCurrentSession(this.chainId, client);
      if (session) {
        await this.onSessionConnected({
          session
        });
        return session;
      }
    }
    return;
  }
  async cleanupPendingPairings() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof this.walletConnector === 'undefined') {
      return;
    }
    try {
      var _this$walletConnector3;
      const inactivePairings = (_this$walletConnector3 = this.walletConnector.core) === null || _this$walletConnector3 === void 0 || (_this$walletConnector3 = _this$walletConnector3.pairing) === null || _this$walletConnector3 === void 0 || (_this$walletConnector3 = _this$walletConnector3.pairings) === null || _this$walletConnector3 === void 0 ? void 0 : _this$walletConnector3.getAll({
        active: false
      });
      if (!isValidArray(inactivePairings)) {
        return;
      }
      for (const pairing of inactivePairings) {
        if (options.deletePairings) {
          var _this$walletConnector4;
          (_this$walletConnector4 = this.walletConnector.core) === null || _this$walletConnector4 === void 0 || (_this$walletConnector4 = _this$walletConnector4.expirer) === null || _this$walletConnector4 === void 0 ? void 0 : _this$walletConnector4.set(pairing.topic, 0);
        } else {
          try {
            var _this$walletConnector5;
            await ((_this$walletConnector5 = this.walletConnector.core) === null || _this$walletConnector5 === void 0 || (_this$walletConnector5 = _this$walletConnector5.relayer) === null || _this$walletConnector5 === void 0 || (_this$walletConnector5 = _this$walletConnector5.subscriber) === null || _this$walletConnector5 === void 0 ? void 0 : _this$walletConnector5.unsubscribe(pairing.topic));
          } catch (error) {
            Logger.error(WalletConnectProviderErrorMessagesEnum.unableToHandleCleanup);
          }
        }
      }
    } catch (error) {
      Logger.error(WalletConnectProviderErrorMessagesEnum.unableToHandleCleanup);
    }
  }
}
//# sourceMappingURL=walletConnectProvider.js.map