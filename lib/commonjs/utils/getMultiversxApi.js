"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMultiversxApi = void 0;
var _urls = require("../constants/urls");
var _connectionConfig = require("../redux/selectors/connectionConfig.selector");
var _types = require("../types");
const getMultiversxApi = async () => {
  const chainId = await (0, _connectionConfig.selectChainID)();
  if (!chainId) {
    return _urls.URLS.MULTIVERSX_API_DEVNET;
  }
  let mxApi = _urls.URLS.MULTIVERSX_API_DEVNET;
  switch (chainId) {
    case _types.ChainEnum.MAINNET:
      {
        mxApi = _urls.URLS.MULTIVERSX_API_MAINNET;
        break;
      }
    case _types.ChainEnum.DEVNET:
      {
        mxApi = _urls.URLS.MULTIVERSX_API_DEVNET;
        break;
      }
    case _types.ChainEnum.TESTNET:
      {
        mxApi = _urls.URLS.MULTIVERSX_API_TESTNET;
        break;
      }
  }
  return mxApi;
};
exports.getMultiversxApi = getMultiversxApi;
//# sourceMappingURL=getMultiversxApi.js.map