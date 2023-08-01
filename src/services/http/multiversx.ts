import axios from 'axios';
import {getMultiversxApi} from '../../utils/getMultiversxApi';
import {ACCOUNTS_ENDPOINT} from '../../constants/mxEndpoints';
import {MxAccount} from '../../types';

export const getAccountTokens = async (address: string) => {
  const mxApi = await getMultiversxApi();
  const url = mxApi + `/accounts/${address}/tokens`;
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

export const getMxAccount = async (address?: string) => {
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
