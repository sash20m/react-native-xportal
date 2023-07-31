import {EnvironmentsEnum, NetworkType} from '../types';

export const networkConfigurations: Record<
  keyof typeof EnvironmentsEnum,
  NetworkType
> = {
  devnet: {
    id: 'devnet',
    chainId: 'D',
    name: 'Devnet',
    egldLabel: 'xEGLD',
    decimals: '18',
    digits: '4',
    gasPerDataByte: '1500',
    walletConnectDeepLink:
      'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/',
    walletAddress: 'https://devnet-wallet.multiversx.com',
    apiAddress: 'https://devnet-api.multiversx.com',
    explorerAddress: 'http://devnet-explorer.multiversx.com',
    apiTimeout: '4000',
  },
  testnet: {
    id: 'testnet',
    chainId: 'T',
    name: 'Testnet',
    egldLabel: 'xEGLD',
    decimals: '18',
    digits: '4',
    gasPerDataByte: '1500',
    walletConnectDeepLink:
      'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/',
    walletAddress: 'https://testnet-wallet.multiversx.com',
    apiAddress: 'https://testnet-api.multiversx.com',
    explorerAddress: 'http://testnet-explorer.multiversx.com',
    apiTimeout: '4000',
  },
  mainnet: {
    id: 'mainnet',
    chainId: '1',
    name: 'Mainnet',
    egldLabel: 'EGLD',
    decimals: '18',
    digits: '4',
    gasPerDataByte: '1500',
    walletConnectDeepLink:
      'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/',
    walletAddress: 'https://wallet.multiversx.com',
    apiAddress: 'https://api.multiversx.com',
    explorerAddress: 'https://explorer.multiversx.com',
    apiTimeout: '4000',
  },
};
