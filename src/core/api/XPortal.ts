import {
  setConnectionConfig,
  updateAccountLoading,
} from '../../redux/slices/connectionConfig.slice';
import {store as reduxStore} from '../../redux/store';
import {
  InitializeParams,
  SendCustomRequestParams,
  SignMessageParams,
  SignTransactionsParams,
} from '../types/xPortal.types';
import {WalletConnectProvider} from '../../services/wallet/walletConnectProvider';
import {
  getWalletConnectProvider,
  setWalletConnectProvider,
} from '../connectionProvider';
import {resetOnLogout, setConnectionOnLogin} from '../../redux/commonActions';
import http from '../../services/http';
import {openXPortal, openXPortalForLogin} from '../../utils/openXPortal';
import {Address, SignableMessage, Transaction} from '@multiversx/sdk-core';
import {
  calcTotalFee,
  createSignableTransactions,
} from '../../services/wallet/utils';
import {SimpleTransactionType} from '../../types';
import {GAS_LIMIT} from '../../constants/gas';
import BigNumber from 'bignumber.js';
import {stringIsFloat} from '../../utils/stringsUtils';
import {
  selectWalletAddress,
  selectWalletBalance,
} from '../../redux/selectors/wallet.selector';
import {selectConnectedState} from '../../redux/selectors/connectionConfig.selector';

class XPortal {
  private relayUrl = 'wss://relay.walletconnect.com';

  constructor() {}

  getWalletAddress(): string | null {
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

  async initialize({
    chainId,
    projectId,
    metadata,
    callbacks,
  }: InitializeParams): Promise<boolean> {
    console.log(chainId, projectId, ' e?');
    await reduxStore.dispatch(setConnectionConfig({chainId, projectId}));

    const options = metadata ? {metadata} : {};
    const connectionProvider = new WalletConnectProvider(
      callbacks,
      chainId,
      this.relayUrl,
      projectId,
      options,
    );
    await connectionProvider.init();

    setWalletConnectProvider(connectionProvider);

    return true;
  }

  async getStoreState() {
    const state = await reduxStore.getState();
    return state;
  }

  async login() {
    const walletConnectProvider = getWalletConnectProvider();
    if (!walletConnectProvider) {
      return;
    }

    if (walletConnectProvider.wasConnected) {
      await walletConnectProvider.reinitialize();
    }

    const {uri: connectorUri, approval} = await walletConnectProvider.connect();

    console.log(`[connectorUri]=${connectorUri}`);

    openXPortalForLogin(connectorUri);

    await reduxStore.dispatch(updateAccountLoading({isAccountLoading: true}));
    try {
      await walletConnectProvider.login({approval});

      const tokens = await http.getAccountTokens(walletConnectProvider.address);
      const account = await http.getMxAccount(walletConnectProvider.address);

      console.log(account, ' ee');
      await reduxStore.dispatch(
        setConnectionOnLogin({
          address: walletConnectProvider.address,
          tokens,
          walletConnectSession: walletConnectProvider.session,
          ...account,
        }),
      );

      setWalletConnectProvider(walletConnectProvider);
    } catch (error: any) {
      // throwError('Could not login with xPortal properly. Please try again');
    }
  }

  async logout() {
    const walletConnectProvider = getWalletConnectProvider();
    if (!walletConnectProvider) {
      return;
    }
    try {
      await walletConnectProvider.logout();
      await reduxStore.dispatch(resetOnLogout());
    } catch (error) {
      console.log('Could not log out');
    }
  }

  async signTransactions({
    transactions,
    minGasLimit = GAS_LIMIT,
  }: SignTransactionsParams): Promise<Transaction[] | null> {
    const transactionsPayload = Array.isArray(transactions)
      ? transactions
      : [transactions];

    const areComplexTransactions = transactionsPayload.every(
      tx => Object.getPrototypeOf(tx).toPlainObject != null,
    );
    let txToSign = transactionsPayload;
    if (!areComplexTransactions) {
      txToSign = await createSignableTransactions(
        transactions as SimpleTransactionType[],
      );
    }

    console.log(txToSign, 'eer?');

    const accountBalance = selectWalletBalance() || 0;
    const bNtotalFee = calcTotalFee(txToSign as Transaction[], minGasLimit);
    const bNbalance = new BigNumber(
      stringIsFloat(String(accountBalance)) ? accountBalance : '0',
    );
    const hasSufficientFunds = bNbalance.minus(bNtotalFee).isGreaterThan(0);

    if (!hasSufficientFunds) {
      throw new Error('Insufficient funds to cover the transaction fees');
    }

    try {
      openXPortal();
    } catch (error) {
      console.log('Sign Transaction in xPortal wallet');
    }

    const walletConnectProvider = getWalletConnectProvider();
    try {
      const signedTransaction = await walletConnectProvider.signTransactions(
        txToSign as Transaction[],
      );

      return signedTransaction;
    } catch (error) {
      console.log('error ', error);
    }
    return null;
    // get again the balances
  }

  async signMessage({
    message,
  }: SignMessageParams): Promise<SignableMessage | null> {
    // validate message
    // other validations
    const address = selectWalletAddress();
    const signableMessage = new SignableMessage({
      address: new Address(address),
      message: Buffer.from(message, 'ascii'),
    });

    try {
      openXPortal();
    } catch (error) {
      console.log('Sign Transaction in xPortal wallet');
    }

    const walletConnectProvider = getWalletConnectProvider();
    try {
      const signedMessage = await walletConnectProvider.signMessage(
        signableMessage,
      );

      return signedMessage;
    } catch (error) {
      console.log(error);
    }

    return null;
  }

  async sendCustomRequest({request}: SendCustomRequestParams): Promise<any> {
    // validations
    try {
      openXPortal();
    } catch (error) {
      console.log('Sign Transaction in xPortal wallet');
    }

    const walletConnectProvider = getWalletConnectProvider();
    try {
      const response = await walletConnectProvider.sendCustomRequest({
        request,
      });

      return response;
    } catch (error) {
      console.log(error);
    }

    return null;
  }

  async ping(): Promise<boolean> {
    // checks
    const walletConnectProvider = getWalletConnectProvider();
    try {
      const response = await walletConnectProvider.ping();

      return response;
    } catch (error) {
      console.log(error);
    }
    return false;
  }
}

// see about expiry in session

export const xPortalSingleton = new XPortal();
