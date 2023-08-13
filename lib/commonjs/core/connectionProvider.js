"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.walletConnectProvider = exports.setWalletConnectProvider = exports.resetWalletConnectProvider = exports.reassignWalletConnectProvider = exports.getWalletConnectProvider = void 0;
// The main provider with the main functions
let walletConnectProvider;
exports.walletConnectProvider = walletConnectProvider;
const setWalletConnectProvider = provider => {
  exports.walletConnectProvider = walletConnectProvider = provider;
};
exports.setWalletConnectProvider = setWalletConnectProvider;
const reassignWalletConnectProvider = provider => {
  Object.assign(walletConnectProvider, provider);
};
exports.reassignWalletConnectProvider = reassignWalletConnectProvider;
const getWalletConnectProvider = () => {
  return walletConnectProvider;
};
exports.getWalletConnectProvider = getWalletConnectProvider;
const resetWalletConnectProvider = () => {
  exports.walletConnectProvider = walletConnectProvider = {};
};
exports.resetWalletConnectProvider = resetWalletConnectProvider;
//# sourceMappingURL=connectionProvider.js.map