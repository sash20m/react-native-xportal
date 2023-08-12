import { URLS } from '../constants/urls';
import { selectChainID } from '../redux/selectors/connectionConfig.selector';
import { ChainEnum } from '../types';

export const getMultiversxApi = async () => {
  const chainId: string | undefined = await selectChainID();
  if (!chainId) {
    return URLS.MULTIVERSX_API_DEVNET;
  }

  let mxApi = URLS.MULTIVERSX_API_DEVNET;
  switch (chainId) {
    case ChainEnum.MAINNET: {
      mxApi = URLS.MULTIVERSX_API_MAINNET;
      break;
    }
    case ChainEnum.DEVNET: {
      mxApi = URLS.MULTIVERSX_API_DEVNET;
      break;
    }
    case ChainEnum.TESTNET: {
      mxApi = URLS.MULTIVERSX_API_TESTNET;
      break;
    }
  }

  return mxApi;
};
