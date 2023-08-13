"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMxAccount = exports.getAccountTokens = void 0;
var _axios = _interopRequireDefault(require("axios"));
var _getMultiversxApi = require("../../utils/getMultiversxApi");
var _mxEndpoints = require("../../constants/mxEndpoints");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Obtains all the tokens for a given address
 */
const getAccountTokens = async address => {
  const mxApi = await (0, _getMultiversxApi.getMultiversxApi)();
  const url = mxApi + `/${_mxEndpoints.ACCOUNTS_ENDPOINT}/${address}/tokens`;
  const {
    data
  } = await _axios.default.get(url);
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
exports.getAccountTokens = getAccountTokens;
const getMxAccount = async address => {
  if (!address) {
    return {};
  }
  const mxApi = await (0, _getMultiversxApi.getMultiversxApi)();
  const url = `${mxApi}/${_mxEndpoints.ACCOUNTS_ENDPOINT}/${address}?withGuardianInfo=true`;
  try {
    const {
      data
    } = await _axios.default.get(url);
    return data;
  } catch (err) {
    console.error('error fetching configuration for ', url);
  }
  return {};
};
exports.getMxAccount = getMxAccount;
//# sourceMappingURL=multiversx.js.map