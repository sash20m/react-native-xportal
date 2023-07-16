import {SignableMessage, Transaction} from '@multiversx/sdk-core';
import {EngineTypes} from '@multiversx/sdk-wallet-connect-provider';

export interface ProviderFeatureOptions {
  callbackUrl?: string;
}

export interface ConnectionProvider {
  init?(): Promise<boolean>;
  login?(options?: ProviderFeatureOptions): Promise<string>;
  logout(options?: ProviderFeatureOptions): Promise<boolean>;
  getAddress(): Promise<string>;
  isInitialized(): boolean;
  isConnected(): Promise<boolean>;
  sendTransaction?(
    transaction: Transaction,
    options?: ProviderFeatureOptions,
  ): Promise<Transaction | void>;
  signTransaction(
    transaction: Transaction,
    options?: ProviderFeatureOptions,
  ): Promise<Transaction>;
  signTransactions(
    transactions: Transaction[],
    options?: ProviderFeatureOptions,
  ): Promise<Transaction[]>;
  signMessage<T extends SignableMessage>(
    message: T,
    options: ProviderFeatureOptions,
  ): Promise<T>;
  sendCustomMessage?({
    method,
    params,
  }: {
    method: string;
    params: any;
  }): Promise<any>;
  sendCustomRequest?(options?: {
    request: EngineTypes.RequestParams['request'];
  }): Promise<any>;
  ping?(): Promise<boolean>;
  relogin?: () => Promise<void>;
}
