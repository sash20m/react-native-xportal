export enum ChainEnum {
  testnet = 'testnet',
  devnet = 'devnet',
  mainnet = 'mainnet',
}

export interface InitializeParams {
  onLogin?: () => any;
  onLogout?: () => any;
  chain: 'mainnet' | 'testnet' | 'devnet' | ChainEnum;
  projectId: string;
}
