import {SignableMessage, Transaction} from '@multiversx/sdk-core';
import {Signature} from '@multiversx/sdk-core/out/signature';
import Client from '@walletconnect/sign-client';
import {
  EngineTypes,
  PairingTypes,
  SessionTypes,
  SignClientTypes,
} from '@walletconnect/types';
import {getSdkError, isValidArray} from '@walletconnect/utils';
import {WALLETCONNECT_MULTIVERSX_NAMESPACE} from './constants';
import {WalletConnectProviderErrorMessagesEnum} from './errors';
import {Logger} from './logger';
import {Operation, OptionalOperation} from './operation';
import {
  applyTransactionSignature,
  addressIsValid,
  getCurrentSession,
  getCurrentTopic,
  getAddressFromSession,
  getConnectionParams,
  ConnectParamsTypes,
  TransactionResponse,
} from './utils';
import {reassignWalletConnectProvider} from '../../core/connectionProvider';

interface SessionEventTypes {
  event: {
    name: string;
    data: any;
  };
  chainId: string;
}

export interface IClientConnect {
  onClientLogin: () => void;
  onClientLogout(): void;
  onClientEvent: (event: SessionEventTypes['event']) => void;
}

export type {
  PairingTypes,
  SessionTypes,
  SessionEventTypes,
  ConnectParamsTypes,
  EngineTypes,
  WalletConnectProviderErrorMessagesEnum,
  Operation,
  OptionalOperation,
};

export class WalletConnectProvider {
  walletConnectRelay: string;
  walletConnectProjectId: string;
  chainId: string = '';
  address: string = '';
  signature: string = '';
  isInitializing: boolean = false;
  walletConnector: Client | undefined;
  session: SessionTypes.Struct | undefined;
  pairings: PairingTypes.Struct[] | undefined;
  processingTopic: string = '';
  options: SignClientTypes.Options | undefined = {};
  wasConnected: boolean = false;

  onClientConnect: IClientConnect;

  constructor(
    onClientConnect: IClientConnect,
    chainId: string,
    walletConnectRelay: string,
    walletConnectProjectId: string,
    options?: SignClientTypes.Options,
  ) {
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
  async init(): Promise<boolean> {
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
            ...this.options,
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

  async reinitialize(): Promise<boolean> {
    const options = this.options?.metadata
      ? {metadata: this.options.metadata}
      : {};

    const connectionProvider = new WalletConnectProvider(
      this.onClientConnect,
      this.chainId,
      this.walletConnectRelay,
      this.walletConnectProjectId,
      options,
    );

    await connectionProvider.init();

    Object.assign(this, connectionProvider);

    reassignWalletConnectProvider(connectionProvider);

    return true;
  }

  /**
   * Returns true if init() was previously called successfully
   */
  isInitialized(): boolean {
    return !!this.walletConnector && !this.isInitializing;
  }

  /**
   * Returns true if provider is initialized and a valid session is set
   */
  isConnected(): Promise<boolean> {
    return new Promise((resolve, _) =>
      resolve(
        Boolean(this.isInitialized() && typeof this.session !== 'undefined'),
      ),
    );
  }

  async connect(options?: ConnectParamsTypes): Promise<{
    uri?: string;
    approval: () => Promise<SessionTypes.Struct>;
  }> {
    if (typeof this.walletConnector === 'undefined') {
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }

    const connectParams = getConnectionParams(this.chainId, options);

    try {
      const response = await this.walletConnector.connect({
        pairingTopic: options?.topic,
        ...connectParams,
      });

      return response;
    } catch (error) {
      this.reset();
      Logger.error(
        options?.topic
          ? WalletConnectProviderErrorMessagesEnum.unableToConnectExisting
          : WalletConnectProviderErrorMessagesEnum.unableToConnect,
      );

      throw new Error(
        options?.topic
          ? WalletConnectProviderErrorMessagesEnum.unableToConnectExisting
          : WalletConnectProviderErrorMessagesEnum.unableToConnect,
      );
    }
  }

  async login(options?: {
    approval?: () => Promise<SessionTypes.Struct>;
    token?: string;
  }): Promise<string> {
    this.isInitializing = true;
    if (typeof this.walletConnector === 'undefined') {
      await this.connect();
    }

    if (typeof this.walletConnector === 'undefined') {
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }

    if (typeof this.session !== 'undefined') {
      await this.logout({topic: this.session?.topic});
    }

    this.wasConnected = true;

    try {
      if (options && options.approval) {
        const session = await options.approval();

        if (options.token) {
          const address = getAddressFromSession(session);

          const selectedNamespace =
            session.namespaces[WALLETCONNECT_MULTIVERSX_NAMESPACE];
          const method = selectedNamespace.methods.includes(
            OptionalOperation.SIGN_NATIVE_AUTH_TOKEN,
          )
            ? OptionalOperation.SIGN_NATIVE_AUTH_TOKEN
            : OptionalOperation.SIGN_LOGIN_TOKEN;

          const {signature}: {signature: string} =
            await this.walletConnector.request({
              chainId: `${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${this.chainId}`,
              topic: session.topic,
              request: {
                method,
                params: {
                  token: options.token,
                  address,
                },
              },
            });

          if (!signature) {
            Logger.error(
              WalletConnectProviderErrorMessagesEnum.unableToSignLoginToken,
            );
            throw new Error(
              WalletConnectProviderErrorMessagesEnum.unableToSignLoginToken,
            );
          }

          return await this.onSessionConnected({
            session,
            signature,
          });
        }

        return await this.onSessionConnected({
          session,
          signature: '',
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
  async logout(options?: {topic?: string}): Promise<boolean> {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }

    try {
      if (
        this.processingTopic ===
        (options?.topic || getCurrentTopic(this.chainId, this.walletConnector))
      ) {
        return true;
      }

      if (options?.topic) {
        this.processingTopic = options.topic;
        await this.walletConnector.disconnect({
          topic: options.topic,
          reason: getSdkError('USER_DISCONNECTED'),
        });
      } else {
        const currentSessionTopic = getCurrentTopic(
          this.chainId,
          this.walletConnector,
        );
        this.processingTopic = currentSessionTopic;
        await this.walletConnector.disconnect({
          topic: currentSessionTopic,
          reason: getSdkError('USER_DISCONNECTED'),
        });

        this.reset();

        await this.cleanupPendingPairings({deletePairings: true});
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
  async getAddress(): Promise<string> {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }

    return this.address;
  }

  /**
   * Fetches the WalletConnect signature
   */
  async getSignature(): Promise<string> {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }

    return this.signature;
  }

  /**
   * Fetches the WalletConnect pairings
   */
  async getPairings(): Promise<PairingTypes.Struct[] | undefined> {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }

    return (
      this.walletConnector?.core?.pairing?.pairings?.getAll({active: true}) ??
      []
    );
  }

  /**
   * Signs a message and returns it signed
   * @param message
   */
  async signMessage(message: SignableMessage): Promise<SignableMessage> {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }

    if (typeof this.session === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
      this.onClientConnect.onClientLogout();
      throw new Error(
        WalletConnectProviderErrorMessagesEnum.sessionNotConnected,
      );
    }

    try {
      const address = await this.getAddress();
      const {signature}: {signature: string} =
        await this.walletConnector.request({
          chainId: `${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${this.chainId}`,
          topic: getCurrentTopic(this.chainId, this.walletConnector),
          request: {
            method: Operation.SIGN_MESSAGE,
            params: {
              address,
              message: message.message.toString(),
            },
          },
        });

      if (!signature) {
        Logger.error(
          WalletConnectProviderErrorMessagesEnum.invalidMessageResponse,
        );
        throw new Error(
          WalletConnectProviderErrorMessagesEnum.invalidMessageResponse,
        );
      }

      try {
        message.applySignature(new Signature(signature));
      } catch (error) {
        Logger.error(
          WalletConnectProviderErrorMessagesEnum.invalidMessageSignature,
        );
        throw new Error(
          WalletConnectProviderErrorMessagesEnum.invalidMessageSignature,
        );
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
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }

    if (typeof this.session === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
      this.onClientConnect.onClientLogout();
      throw new Error(
        WalletConnectProviderErrorMessagesEnum.sessionNotConnected,
      );
    }

    const plainTransaction = transaction.toPlainObject();

    if (this.chainId !== transaction.getChainID().valueOf()) {
      Logger.error(
        WalletConnectProviderErrorMessagesEnum.requestDifferentChain,
      );
      throw new Error(
        WalletConnectProviderErrorMessagesEnum.requestDifferentChain,
      );
    }

    try {
      const response: TransactionResponse = await this.walletConnector.request({
        chainId: `${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${this.chainId}`,
        topic: getCurrentTopic(this.chainId, this.walletConnector),
        request: {
          method: Operation.SIGN_TRANSACTION,
          params: {
            transaction: plainTransaction,
          },
        },
      });

      return applyTransactionSignature({transaction, response});
    } catch (error) {
      throw new Error(WalletConnectProviderErrorMessagesEnum.transactionError);
    }
  }

  /**
   * Signs an array of transactions and returns it signed
   * @param transactions
   */
  async signTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }

    if (typeof this.session === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
      this.onClientConnect.onClientLogout();
      throw new Error(
        WalletConnectProviderErrorMessagesEnum.sessionNotConnected,
      );
    }

    const plainTransactions = transactions.map(transaction => {
      if (this.chainId !== transaction.getChainID().valueOf()) {
        Logger.error(
          WalletConnectProviderErrorMessagesEnum.requestDifferentChain,
        );
        throw new Error(
          WalletConnectProviderErrorMessagesEnum.requestDifferentChain,
        );
      }
      return transaction.toPlainObject();
    });

    try {
      const {signatures}: {signatures: TransactionResponse[]} =
        await this.walletConnector.request({
          chainId: `${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${this.chainId}`,
          topic: getCurrentTopic(this.chainId, this.walletConnector),
          request: {
            method: Operation.SIGN_TRANSACTIONS,
            params: {
              transactions: plainTransactions,
            },
          },
        });

      if (!signatures) {
        Logger.error(
          WalletConnectProviderErrorMessagesEnum.invalidTransactionResponse,
        );
        throw new Error(
          WalletConnectProviderErrorMessagesEnum.invalidTransactionResponse,
        );
      }

      if (
        !Array.isArray(signatures) ||
        transactions.length !== signatures.length
      ) {
        throw new Error(
          WalletConnectProviderErrorMessagesEnum.invalidTransactionResponse,
        );
      }

      for (const [index, transaction] of transactions.entries()) {
        const response = signatures[index];
        applyTransactionSignature({transaction, response});
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

  async sendCustomRequest(options?: {
    request: EngineTypes.RequestParams['request'];
  }): Promise<any> {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }

    if (typeof this.session === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
      this.onClientConnect.onClientLogout();
      throw new Error(
        WalletConnectProviderErrorMessagesEnum.sessionNotConnected,
      );
    }

    if (options?.request?.method) {
      try {
        const request = {...options.request};
        let {method} = request;

        const {response}: {response: any} = await this.walletConnector.request({
          chainId: `${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${this.chainId}`,
          topic: getCurrentTopic(this.chainId, this.walletConnector),
          request: {...request, method},
        });

        if (!response) {
          Logger.error(
            WalletConnectProviderErrorMessagesEnum.invalidCustomRequestResponse,
          );
        }
        return response;
      } catch (error) {
        Logger.error(
          WalletConnectProviderErrorMessagesEnum.invalidCustomRequestResponse,
        );
      }

      return;
    }
  }

  /**
   * Ping helper
   */

  async ping(): Promise<boolean> {
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
        topic,
      });
      return true;
    } catch (error) {
      Logger.error(WalletConnectProviderErrorMessagesEnum.pingFailed);
      return false;
    }
  }

  private async loginAccount(options?: {
    address: string;
    signature?: string;
  }): Promise<string> {
    if (!options) {
      return '';
    }

    if (addressIsValid(options.address)) {
      this.address = options.address;
      if (options.signature) {
        this.signature = options.signature;
      }
      this.onClientConnect.onClientLogin();

      return this.address;
    }

    Logger.error(
      `${WalletConnectProviderErrorMessagesEnum.invalidAddress} ${options.address}`,
    );
    if (this.walletConnector) {
      await this.logout();
    }

    return '';
  }

  private async onSessionConnected(options?: {
    session: SessionTypes.Struct;
    signature?: string;
  }): Promise<string> {
    if (!options) {
      return '';
    }

    this.session = options.session;

    const address = getAddressFromSession(options.session);

    if (address) {
      await this.loginAccount({address, signature: options.signature});

      return address;
    }

    return '';
  }

  private async handleTopicUpdateEvent({
    topic,
  }: {
    topic: string;
  }): Promise<void> {
    if (typeof this.walletConnector === 'undefined') {
      Logger.error(WalletConnectProviderErrorMessagesEnum.notInitialized);
      return;
    }

    try {
      const existingPairings = await this.getPairings();

      if (this.address && !this.isInitializing && existingPairings) {
        if (existingPairings?.length === 0) {
          this.onClientConnect.onClientLogout();
        } else {
          const lastActivePairing =
            existingPairings[existingPairings.length - 1];

          if (lastActivePairing?.topic === topic) {
            this.onClientConnect.onClientLogout();
          }
        }
      }
    } catch (error) {
      Logger.error(WalletConnectProviderErrorMessagesEnum.unableToHandleTopic);
    } finally {
      this.pairings = await this.getPairings();
    }
  }

  private async handleSessionEvents({
    topic,
    params,
  }: {
    topic: string;
    params: SessionEventTypes;
  }): Promise<void> {
    if (typeof this.walletConnector === 'undefined') {
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }
    if (this.session && this.session?.topic !== topic) {
      return;
    }

    const {event} = params;
    if (
      event?.name &&
      getCurrentTopic(this.chainId, this.walletConnector) === topic
    ) {
      const eventData = event.data;

      this.onClientConnect.onClientEvent(eventData);
    }
  }

  private async subscribeToEvents(client: Client): Promise<void> {
    if (typeof client === 'undefined') {
      throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
    }

    try {
      // Session Events
      client.on('session_update', ({topic, params}) => {
        if (!this.session || this.session?.topic !== topic) {
          return;
        }

        const {namespaces} = params;
        const _session = client.session.get(topic);
        const updatedSession = {..._session, namespaces};
        this.onSessionConnected({session: updatedSession});
      });

      client.on('session_event', this.handleSessionEvents.bind(this));

      client.on('session_delete', async ({topic}) => {
        if (this.isInitializing) {
          this.onClientConnect.onClientLogout();
          this.reset();
        }

        if (!this.session || this.session?.topic !== topic) {
          return;
        }

        Logger.error(WalletConnectProviderErrorMessagesEnum.sessionDeleted);

        this.onClientConnect.onClientLogout();

        this.reset();
        await this.cleanupPendingPairings({deletePairings: true});
      });

      client.on('session_expire', async ({topic}) => {
        if (!this.session || this.session?.topic !== topic) {
          return;
        }

        Logger.error(WalletConnectProviderErrorMessagesEnum.sessionExpired);
        this.onClientConnect.onClientLogout();

        this.reset();
        await this.cleanupPendingPairings({deletePairings: true});
      });

      // Pairing Events
      client.core?.pairing?.events.on(
        'pairing_delete',
        this.handleTopicUpdateEvent.bind(this),
      );

      client.core?.pairing?.events.on(
        'pairing_expire',
        this.handleTopicUpdateEvent.bind(this),
      );
    } catch (error) {
      Logger.error(WalletConnectProviderErrorMessagesEnum.unableToHandleEvent);
    }
  }

  private async checkPersistedState(
    client: Client,
  ): Promise<SessionTypes.Struct | undefined> {
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
        await this.onSessionConnected({session});

        return session;
      }
    }

    return;
  }

  private async cleanupPendingPairings(
    options: {deletePairings?: boolean} = {},
  ): Promise<void> {
    if (typeof this.walletConnector === 'undefined') {
      return;
    }

    try {
      const inactivePairings =
        this.walletConnector.core?.pairing?.pairings?.getAll({active: false});

      if (!isValidArray(inactivePairings)) {
        return;
      }

      for (const pairing of inactivePairings) {
        if (options.deletePairings) {
          this.walletConnector.core?.expirer?.set(pairing.topic, 0);
        } else {
          try {
            await this.walletConnector.core?.relayer?.subscriber?.unsubscribe(
              pairing.topic,
            );
          } catch (error) {
            Logger.error(
              WalletConnectProviderErrorMessagesEnum.unableToHandleCleanup,
            );
          }
        }
      }
    } catch (error) {
      Logger.error(
        WalletConnectProviderErrorMessagesEnum.unableToHandleCleanup,
      );
    }
  }
}
