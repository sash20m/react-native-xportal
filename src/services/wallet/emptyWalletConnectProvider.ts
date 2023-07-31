/* eslint-disable @typescript-eslint/no-unused-vars */
import {SignableMessage, Transaction} from '@multiversx/sdk-core';
import {
  EngineTypes,
  PairingTypes,
  SessionEventTypes,
  SessionTypes,
} from '@multiversx/sdk-wallet-connect-provider';
import {ConnectionProvider} from '../../core/types/connectionProvider.types';
import {
  ConnectParamsTypes,
  WalletConnectProvider,
} from './walletConnectProvider';
import Client from '@walletconnect/sign-client';

const notInitializedError = (caller: string) => {
  return `Unable to perform ${caller}. Connection provider not initialized`;
};

interface IClientConnect {
  onClientLogin: () => void;
  onClientLogout(): void;
  onClientEvent: (event: SessionEventTypes['event']) => void;
}

export class EmptyProvider {
  walletConnectRelay = '';
  walletConnectProjectId = '';
  chainId: string = '';
  address: string = '';
  signature: string = '';
  isInitializing: boolean = false;
  walletConnector: undefined;
  session: undefined;
  pairings: undefined;
  processingTopic: string = '';
  options: undefined;

  onClientConnect: IClientConnect | any = {};

  reset() {
    this.address = '';
  }

  init(): Promise<boolean> {
    return Promise.resolve(false);
  }

  login<TOptions = {callbackUrl?: string} | undefined, TResponse = string>(
    options?: TOptions,
  ): Promise<TResponse> {
    throw new Error(notInitializedError(`login with options: ${options}`));
  }

  logout<TOptions = {callbackUrl?: string}, TResponse = boolean>(
    options?: TOptions,
  ): Promise<TResponse> {
    throw new Error(notInitializedError(`logout with options: ${options}`));
  }

  async connect(options?: ConnectParamsTypes): Promise<{
    uri?: string;
    approval: () => Promise<SessionTypes.Struct>;
  }> {
    throw new Error(notInitializedError(`connect with options: ${options}`));
  }

  getAddress(): Promise<string> {
    throw new Error(notInitializedError('getAddress'));
  }

  isInitialized(): boolean {
    return false;
  }

  isConnected(): Promise<boolean> {
    return Promise.resolve(false);
  }

  sendTransaction?<TOptions = {callbackUrl?: string}, TResponse = Transaction>(
    transaction: Transaction,
    options?: TOptions,
  ): Promise<TResponse> {
    throw new Error(
      notInitializedError(
        `sendTransaction with transactions: ${transaction} options: ${options}`,
      ),
    );
  }

  signTransaction<TOptions = {callbackUrl?: string}, TResponse = Transaction>(
    transaction: Transaction,
    options?: TOptions,
  ): Promise<TResponse> {
    throw new Error(
      notInitializedError(
        `signTransaction with transactions: ${transaction} options: ${options}`,
      ),
    );
  }

  signTransactions<TOptions = {callbackUrl?: string}, TResponse = []>(
    transactions: [],
    options?: TOptions,
  ): Promise<TResponse> {
    throw new Error(
      notInitializedError(
        `signTransactions with transactions: ${transactions} options: ${options}`,
      ),
    );
  }

  signMessage(message: SignableMessage): Promise<SignableMessage> {
    throw new Error(notInitializedError(`signTransactions with ${message}`));
  }

  sendCustomMessage({
    method,
    params,
  }: {
    method: string;
    params: any;
  }): Promise<any> {
    throw new Error(
      notInitializedError(
        `sendCustomMessage with method: ${method} params: ${params}`,
      ),
    );
  }

  sendCustomRequest(options?: {
    request: EngineTypes.RequestParams['request'];
  }): Promise<any> {
    throw new Error(
      notInitializedError(`sendSessionEvent with options: ${options}`),
    );
  }

  ping(): Promise<boolean> {
    return Promise.resolve(false);
  }

  async getSignature(): Promise<string> {
    return this.signature;
  }

  async getPairings(): Promise<PairingTypes.Struct[] | undefined> {
    throw new Error(notInitializedError('getPairings'));
  }

  private async loginAccount(options?: {
    address: string;
    signature?: string;
  }): Promise<string> {
    throw new Error(notInitializedError('loginAccount'));
  }

  private async onSessionConnected(options?: {
    session: SessionTypes.Struct;
    signature?: string;
  }): Promise<string> {
    throw new Error(notInitializedError('onSessionConnected'));
  }

  private async handleTopicUpdateEvent({
    topic,
  }: {
    topic: string;
  }): Promise<void> {
    throw new Error(notInitializedError('handleTopicUpdateEvent'));
  }

  private async handleSessionEvents({
    topic,
    params,
  }: {
    topic: string;
    params: SessionEventTypes;
  }): Promise<void> {
    throw new Error(notInitializedError('handleSessionEvents'));
  }

  private async subscribeToEvents(client: Client): Promise<void> {
    throw new Error(notInitializedError('subscribeToEvents'));
  }

  private async checkPersistedState(
    client: Client,
  ): Promise<SessionTypes.Struct | undefined> {
    throw new Error(notInitializedError('checkPersistedState'));
  }

  private async cleanupPendingPairings(
    options: {deletePairings?: boolean} = {},
  ): Promise<void> {
    throw new Error(notInitializedError('cleanupPendingPairings'));
  }
}

export const emptyProvider = new EmptyProvider();
