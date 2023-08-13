"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectConnectedState = exports.selectChainID = void 0;
var _store = require("../../redux/store");
const selectChainID = () => {
  const state = _store.store.getState();
  return state.connectionConfigSlice.chainId;
};
exports.selectChainID = selectChainID;
const selectConnectedState = () => {
  const state = _store.store.getState();
  return state.connectionConfigSlice.connected;
};
exports.selectConnectedState = selectConnectedState;
//# sourceMappingURL=connectionConfig.selector.js.map