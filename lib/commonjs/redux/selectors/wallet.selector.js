"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectWalletBalance = exports.selectWalletAddress = exports.selectAccountTokens = exports.selectAccountBalance = exports.selectAccount = void 0;
var _store = require("../../redux/store");
const selectWalletAddress = () => {
  const state = _store.store.getState();
  return state.walletSlice.address;
};
exports.selectWalletAddress = selectWalletAddress;
const selectWalletBalance = () => {
  const state = _store.store.getState();
  return state.walletSlice.balance;
};
exports.selectWalletBalance = selectWalletBalance;
const selectAccount = () => {
  const state = _store.store.getState().walletSlice;
  delete state.walletConnectSession;
  return state;
};
exports.selectAccount = selectAccount;
const selectAccountTokens = () => {
  const state = _store.store.getState();
  return state.walletSlice.tokens;
};
exports.selectAccountTokens = selectAccountTokens;
const selectAccountBalance = () => {
  const state = _store.store.getState();
  return state.walletSlice.balance;
};
exports.selectAccountBalance = selectAccountBalance;
//# sourceMappingURL=wallet.selector.js.map