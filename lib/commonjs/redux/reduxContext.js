"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useStore = exports.useSelector = exports.useDispatch = exports.DappCoreContext = void 0;
var _react = require("react");
var _reactRedux = require("react-redux");
var _store = require("./store");
const defaultContextValue = {
  store: _store.store,
  subscription: _store.subscription
};
const DappCoreContext = /*#__PURE__*/(0, _react.createContext)(defaultContextValue);
exports.DappCoreContext = DappCoreContext;
const useStore = (0, _reactRedux.createStoreHook)(DappCoreContext);
exports.useStore = useStore;
const useDispatch = (0, _reactRedux.createDispatchHook)(DappCoreContext);
exports.useDispatch = useDispatch;
const useSelector = (0, _reactRedux.createSelectorHook)(DappCoreContext);
exports.useSelector = useSelector;
//# sourceMappingURL=reduxContext.js.map