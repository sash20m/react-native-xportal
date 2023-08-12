import { Buffer } from 'buffer';

export function isStringBase64(str: string) {
  try {
    // Try to decode the string and encode it back using base64 functions
    const atobDecoded = atob(str);
    const btoaEncoded = btoa(atobDecoded);
    const bufferFromDecoded = Buffer.from(str, 'base64').toString();
    const bufferFromEncoded = Buffer.from(bufferFromDecoded).toString('base64');

    // If the result is equal to the initial string
    const isEqualToInitialString = str === btoaEncoded && str === bufferFromEncoded;

    // or the atob() conversion is equal to the Buffer.from('base64')
    const isAtobEqualToBufferFrom = atobDecoded === bufferFromDecoded;

    if (isEqualToInitialString || isAtobEqualToBufferFrom) {
      // it is a regular base64 string
      return true;
    }
  } catch (e) {
    return false;
  }

  return false;
}

import BigNumber from 'bignumber.js';

export const stringIsInteger = (integer: string, positiveNumbersOnly = true) => {
  const stringInteger = String(integer);
  if (!stringInteger.match(/^[-]?\d+$/)) {
    return false;
  }
  const bNparsed = new BigNumber(stringInteger);
  const limit = positiveNumbersOnly ? 0 : -1;
  return bNparsed.toString(10) === stringInteger && bNparsed.comparedTo(0) >= limit;
};

export const stringIsFloat = (amount: string) => {
  if (isNaN(amount as any)) {
    return false;
  }
  if (amount == null) {
    return false;
  }
  if (String(amount).includes('Infinity')) {
    return false;
  }

  let [wholes, decimals] = amount.split('.');
  if (decimals) {
    while (decimals.charAt(decimals.length - 1) === '0') {
      decimals = decimals.slice(0, -1);
    }
  }
  const number = decimals ? [wholes, decimals].join('.') : wholes;
  const bNparsed = new BigNumber(number);
  return bNparsed.toString(10) === number && bNparsed.comparedTo(0) >= 0;
};
