import axios from 'axios';
import {getMultiversxApi} from '../../utils/getMultiversxApi';
import {ACCOUNTS_ENDPOINT} from '../../constants/mxEndpoints';
import {MxAccount} from '../../types';
import {Tokens} from '../../redux/slices/wallet.slice';

/**
 * Obtains all the tokens for a given address
 */
export const getAccountTokens = async (address: string): Promise<Tokens[]> => {
  const mxApi = await getMultiversxApi();
  const url = mxApi + `/${ACCOUNTS_ENDPOINT}/${address}/tokens`;
  const {data} = await axios.get(url);

  const tokens = data.map((token: any) => {
    const ticker = token?.ticker || '';
    const name = token?.name || '';
    const identifier = token?.identifier || '';

    const balanceInteger = token.balance.slice(
      0,
      token.balance.length - token.decimals,
    );
    const balanceDecimals = token.balance.slice(
      token.balance.length - token.decimals,
      token.balance.length - token.decimals + 4,
    );

    const balance = parseFloat(`${balanceInteger}.${balanceDecimals}`);
    const valueUsd = token.valueUsd ? token.valueUsd.toFixed(4) : 0;

    return {ticker, name, identifier, balance, valueUsd};
  });

  return tokens;
};

/**
 * Obtains the account information for a given address that is provided
 * by the multiversx api. This comes to complete the information that is
 * obtained from the wallet directly via walletconnect.
 */
export const getMxAccount = async (address?: string): Promise<MxAccount> => {
  if (!address) {
    return {};
  }
  const mxApi = await getMultiversxApi();
  const url = `${mxApi}/${ACCOUNTS_ENDPOINT}/${address}?withGuardianInfo=true`;

  try {
    const {data} = await axios.get<MxAccount>(url);
    return data;
  } catch (err) {
    console.error('error fetching configuration for ', url);
  }
  return {};
};
