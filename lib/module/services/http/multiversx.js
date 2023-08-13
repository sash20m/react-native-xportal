import axios from 'axios';
import { getMultiversxApi } from '../../utils/getMultiversxApi';
import { ACCOUNTS_ENDPOINT } from '../../constants/mxEndpoints';
/**
 * Obtains all the tokens for a given address
 */
export const getAccountTokens = async address => {
  const mxApi = await getMultiversxApi();
  const url = mxApi + `/${ACCOUNTS_ENDPOINT}/${address}/tokens`;
  const {
    data
  } = await axios.get(url);
  const tokens = data.map(token => {
    const ticker = (token === null || token === void 0 ? void 0 : token.ticker) || '';
    const name = (token === null || token === void 0 ? void 0 : token.name) || '';
    const identifier = (token === null || token === void 0 ? void 0 : token.identifier) || '';
    const balanceInteger = token.balance.slice(0, token.balance.length - token.decimals);
    const balanceDecimals = token.balance.slice(token.balance.length - token.decimals, token.balance.length - token.decimals + 4);
    const balance = parseFloat(`${balanceInteger}.${balanceDecimals}`);
    const valueUsd = token.valueUsd ? token.valueUsd.toFixed(4) : 0;
    return {
      ticker,
      name,
      identifier,
      balance,
      valueUsd
    };
  });
  return tokens;
};

/**
 * Obtains the account information for a given address that is provided
 * by the multiversx api. This comes to complete the information that is
 * obtained from the wallet directly via walletconnect.
 */
export const getMxAccount = async address => {
  if (!address) {
    return {};
  }
  const mxApi = await getMultiversxApi();
  const url = `${mxApi}/${ACCOUNTS_ENDPOINT}/${address}?withGuardianInfo=true`;
  try {
    const {
      data
    } = await axios.get(url);
    return data;
  } catch (err) {
    console.error('error fetching configuration for ', url);
  }
  return {};
};
//# sourceMappingURL=multiversx.js.map