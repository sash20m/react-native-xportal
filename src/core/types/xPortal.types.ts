import {Transaction} from '@multiversx/sdk-core/out';
import {IClientConnect} from '../../services/wallet/walletConnectProvider';
import {ChainEnum, SimpleTransactionType} from '../../types';
import {EngineTypes} from '@walletconnect/types';

export interface ConnectionMetadata {
  description: string;
  url: string;
  icons: string[];
  name: string;
}

export interface InitializeParams {
  onLogin?: () => any;
  onLogout?: () => any;
  chainId: '1' | 't' | 'd' | ChainEnum;
  projectId: string;
  metadata?: ConnectionMetadata;
  callbacks: IClientConnect;
}

export interface SignTransactionsParams {
  transactions: (Transaction | SimpleTransactionType)[];
  minGasLimit?: number;
}
export interface SignMessageParams {
  message: string;
}
export interface SendCustomRequestParams {
  request: EngineTypes.RequestParams['request'];
}
