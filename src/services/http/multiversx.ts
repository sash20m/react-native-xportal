import axios from 'axios';
import {URLS} from '../../constants/urls';

export const getAccountTokens = async (address: string) => {
  const url = URLS.MULTIVERSX_API + `/accounts/${address}/tokens`;
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
