import {IClientConnect} from '../../services/walletConnectProvider/walletConnectProvider';

export enum ChainEnum {
  testnet = 't',
  devnet = 'd',
  mainnet = '1',
}

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
