import {
  updateAccountLoading,
  updateConnectionConfig,
} from '../redux/slices/connectionConfig.slice';
import { Tokens, updateWallet } from '../redux/slices/wallet.slice';
import { store as reduxStore } from '../redux/store';
import {
  InitializeParams,
  AccountResponse,
  SendCustomRequestParams,
  SignMessageParams,
  SignTransactionsParams,
  WatchTransactionParams,
  TokenList,
} from '../types/xPortal.types';
import { IClientConnect, WalletConnectProvider } from '../services/wallet/walletConnectProvider';
import { getWalletConnectProvider, setWalletConnectProvider } from './connectionProvider';
import { resetOnLogout, setConnectionOnLogin } from '../redux/commonActions';
import http from '../services/http';
import { openXPortal, openXPortalForLogin } from '../utils/openXPortal';
import {
  Address,
  ITransactionStatus,
  SignableMessage,
  Transaction,
  TransactionWatcher,
} from '@multiversx/sdk-core';
import { calcTotalFee, createSignableTransactions } from '../services/wallet/utils';
import { ITransactionWatcherTransaction, SimpleTransactionType } from '../types';
import { GAS_LIMIT } from '../constants/gas';
import BigNumber from 'bignumber.js';
import { stringIsFloat } from '../utils/stringsUtils';
import {
  selectAccount,
  selectAccountBalance,
  selectAccountTokens,
  selectWalletAddress,
  selectWalletBalance,
} from '../redux/selectors/wallet.selector';
import { selectConnectedState } from '../redux/selectors/connectionConfig.selector';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers/out';
import { URLS } from '../constants/urls';
import { SessionEventTypes } from '@multiversx/sdk-wallet-connect-provider/out';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import { validateInitParams } from '../utils/validators/initializeParamsValidator';
import { errorComposer } from '../utils/errorComposer';

class XPortal {
  private relayUrl = 'wss://relay.walletconnect.com';

  constructor() {}

  getWalletAddress(): string | null {
    const walletConnectProvider = getWalletConnectProvider();
    if (!walletConnectProvider?.walletConnector) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    const address = selectWalletAddress();

    if (!address) {
      return null;
    }
    return address;
  }

  isConnected(): boolean {
    const state = selectConnectedState();
    return !!state;
  }

  getFullAccountInfo(): AccountResponse {
    const walletConnectProvider = getWalletConnectProvider();
    if (!walletConnectProvider?.walletConnector) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    const account = selectAccount() as AccountResponse;
    return account;
  }

  getAccountTokensList(): Tokens[] | undefined {
    const walletConnectProvider = getWalletConnectProvider();
    if (!walletConnectProvider?.walletConnector) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    const tokens = selectAccountTokens();
    return tokens;
  }

  getAccountBalance(): string | undefined {
    const walletConnectProvider = getWalletConnectProvider();
    if (!walletConnectProvider?.walletConnector) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    const balance = selectAccountBalance();
    return balance;
  }

  async initialize({
    chainId,
    projectId,
    metadata,
    callbacks,
  }: InitializeParams): Promise<boolean> {
    if (!validateInitParams({ chainId, projectId, metadata, callbacks })) {
      throw new Error(ERROR_MESSAGES.MISSING_INIT_PARAMS);
    }

    try {
      await reduxStore.dispatch(updateConnectionConfig({ chainId, projectId }));

      const options = metadata ? { metadata } : {};
      const connectionProvider = new WalletConnectProvider(
        this.enrichCallbacks(callbacks),
        chainId,
        this.relayUrl,
        projectId,
        options
      );
      await connectionProvider.init();

      setWalletConnectProvider(connectionProvider);
      return true;
    } catch (error) {
      throw new Error(errorComposer({ message: ERROR_MESSAGES.INIT_FAILED, data: error }));
    }
  }

  async login(): Promise<Boolean> {
    const walletConnectProvider = getWalletConnectProvider();
    if (!walletConnectProvider?.walletConnector && !walletConnectProvider.wasConnected) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }

    if (walletConnectProvider.wasConnected) {
      await walletConnectProvider.reinitialize();
    }

    try {
      const { uri: connectorUri, approval } = await walletConnectProvider.connect();

      openXPortalForLogin(connectorUri);

      await reduxStore.dispatch(updateAccountLoading({ isAccountLoading: true }));
      await walletConnectProvider.login({ approval });

      const tokens = await http.getAccountTokens(walletConnectProvider.address);
      const account = await http.getMxAccount(walletConnectProvider.address);

      await reduxStore.dispatch(
        setConnectionOnLogin({
          address: walletConnectProvider.address,
          tokens,
          walletConnectSession: walletConnectProvider.session,
          ...account,
        })
      );

      setWalletConnectProvider(walletConnectProvider);

      return true;
    } catch (error: any) {
      throw new Error(errorComposer({ message: ERROR_MESSAGES.LOGIN_FAILED, data: error }));
    }
  }

  async logout(): Promise<Boolean> {
    const walletConnectProvider = getWalletConnectProvider();
    if (!walletConnectProvider?.walletConnector) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }

    try {
      await reduxStore.dispatch(resetOnLogout());
      await walletConnectProvider.logout();
      return true;
    } catch (error) {
      throw new Error(errorComposer({ message: ERROR_MESSAGES.LOGIN_FAILED, data: error }));
    }
  }

  async signTransactions({
    transactions,
    minGasLimit = GAS_LIMIT,
  }: SignTransactionsParams): Promise<Transaction[]> {
    const walletConnectProvider = getWalletConnectProvider();
    if (!walletConnectProvider?.walletConnector) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }

    try {
      const transactionsPayload = Array.isArray(transactions) ? transactions : [transactions];

      const areComplexTransactions = transactionsPayload.every(
        (tx) => Object.getPrototypeOf(tx).toPlainObject != null
      );
      let txToSign = transactionsPayload;

      const hasNonces = txToSign.every((tx) => 'nonce' in tx);
      if (!hasNonces) {
        throw new Error(ERROR_MESSAGES.TX_WITHOUT_NONCE);
      }

      if (!areComplexTransactions) {
        txToSign = await createSignableTransactions(transactions as SimpleTransactionType[]);
      }

      const accountBalance = selectWalletBalance() || 0;
      const bNtotalFee = calcTotalFee(txToSign as Transaction[], minGasLimit);
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
        const signedTransaction = await walletConnectProvider.signTransactions(
          txToSign as Transaction[]
        );

        return signedTransaction;
      } catch (error) {
        throw new Error(
          errorComposer({
            message: ERROR_MESSAGES.SIGN_TX_FAILED,
            data: error,
          })
        );
      }
    } catch (error) {
      throw new Error(
        errorComposer({
          message: ERROR_MESSAGES.SIGN_TX_PREPARATION_FAILED,
          data: error,
        })
      );
    }
  }

  async signMessage({ message }: SignMessageParams): Promise<SignableMessage> {
    const walletConnectProvider = getWalletConnectProvider();
    if (!walletConnectProvider?.walletConnector) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    if (!message || typeof message !== 'string') {
      throw new Error(ERROR_MESSAGES.MESSAGE_INVALID);
    }

    try {
      const address = selectWalletAddress();
      const signableMessage = new SignableMessage({
        address: new Address(address),
        message: Buffer.from(message, 'ascii'),
      });

      try {
        openXPortal();
      } catch (error) {
        console.warn('Sign Transaction in xPortal wallet');
      }

      const signedMessage = await walletConnectProvider.signMessage(signableMessage);

      return signedMessage;
    } catch (error) {
      throw new Error(
        errorComposer({
          message: ERROR_MESSAGES.SIGN_MESSAGE_FAILED,
          data: error,
        })
      );
    }
  }

  async sendCustomRequest({ request }: SendCustomRequestParams): Promise<any> {
    const walletConnectProvider = getWalletConnectProvider();
    if (!walletConnectProvider?.walletConnector) {
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
        request,
      });

      return response;
    } catch (error) {
      throw new Error(
        errorComposer({
          message: ERROR_MESSAGES.CUSTOM_RQ_FAILED,
          data: error,
        })
      );
    }
  }

  async ping(): Promise<boolean> {
    const walletConnectProvider = getWalletConnectProvider();
    if (!walletConnectProvider?.walletConnector) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }

    try {
      const response = await walletConnectProvider?.ping();

      return response;
    } catch (error) {
      throw new Error(
        errorComposer({
          message: ERROR_MESSAGES.FAILED_PING,
          data: error,
        })
      );
    }
  }

  async refreshAccountData(): Promise<AccountResponse> {
    const walletConnectProvider = getWalletConnectProvider();
    if (!walletConnectProvider?.walletConnector) {
      throw new Error(ERROR_MESSAGES.XPORTAL_NOT_INITIALIZED);
    }
    try {
      const tokens = await http.getAccountTokens(walletConnectProvider.address);
      const account = await http.getMxAccount(walletConnectProvider.address);

      await reduxStore.dispatch(
        updateWallet({
          tokens,
          ...account,
        })
      );

      return { tokens, ...account };
    } catch (error) {
      throw new Error(
        errorComposer({
          message: ERROR_MESSAGES.FAILED_REFRESH_ACCOUNT,
          data: error,
        })
      );
    }
  }

  async watchTransaction({
    transactionHash,
    withUpdateAccountData,
    pollingIntervalMilliseconds = 1000,
    timeoutMilliseconds = 180000,
  }: WatchTransactionParams): Promise<ITransactionStatus> {
    const provider = new ProxyNetworkProvider(URLS.MULTIVERSX_GATEWAY);

    const transaction: ITransactionWatcherTransaction = {
      getHash: () => ({
        hex: () => transactionHash,
      }),
    };

    try {
      const watcher = new TransactionWatcher(provider, {
        pollingIntervalMilliseconds,
        timeoutMilliseconds,
      });
      const res = await watcher.awaitCompleted(transaction);

      if (res.status.isFailed()) {
        throw new Error('Transaction failed');
      }

      if (withUpdateAccountData) {
        await this.refreshAccountData();
      }

      return res.status;
    } catch (error: any) {
      throw new Error(
        errorComposer({
          message: ERROR_MESSAGES.WATCHER_ERROR,
          data: error,
        })
      );
    }
  }

  private enrichCallbacks(callbacks: IClientConnect) {
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
      onClientEvent: (event: SessionEventTypes['event']) => {
        // some future needed code on event
        // ...

        callbacks.onClientEvent(event);
      },
    };

    return newCallbacks;
  }
}

export const xPortalSingleton = new XPortal();
