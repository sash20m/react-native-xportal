"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isStringBase64 = isStringBase64;
exports.stringIsInteger = exports.stringIsFloat = void 0;
var _buffer = require("buffer");
var _bignumber = _interopRequireDefault(require("bignumber.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function isStringBase64(str) {
  try {
    // Try to decode the string and encode it back using base64 functions
    const atobDecoded = atob(str);
    const btoaEncoded = btoa(atobDecoded);
    const bufferFromDecoded = _buffer.Buffer.from(str, 'base64').toString();
    const bufferFromEncoded = _buffer.Buffer.from(bufferFromDecoded).toString('base64');

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
const stringIsInteger = function (integer) {
  let positiveNumbersOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  const stringInteger = String(integer);
  if (!stringInteger.match(/^[-]?\d+$/)) {
    return false;
  }
  const bNparsed = new _bignumber.default(stringInteger);
  const limit = positiveNumbersOnly ? 0 : -1;
  return bNparsed.toString(10) === stringInteger && bNparsed.comparedTo(0) >= limit;
};
exports.stringIsInteger = stringIsInteger;
const stringIsFloat = amount => {
  if (isNaN(amount)) {
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
  const bNparsed = new _bignumber.default(number);
  return bNparsed.toString(10) === number && bNparsed.comparedTo(0) >= 0;
};
exports.stringIsFloat = stringIsFloat;
//# sourceMappingURL=stringsUtils.js.map