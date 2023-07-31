import {IClientConnect} from '../../services/wallet/walletConnectProvider';
import {ChainEnum} from '../../types';

export interface ConnectionMetadata {
  description: string;
  url: string;
  icons: string[];
  name: string;
}

export interface InitializeParams {
  onLogin?: () => any;
  onLogout?: () => any;
  chain: '1' | 't' | 'd' | ChainEnum;
  projectId: string;
  metadata?: ConnectionMetadata;
  callbacks: IClientConnect;
}
