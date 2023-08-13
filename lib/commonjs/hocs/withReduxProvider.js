"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = withReduxProvider;
var _react = _interopRequireDefault(require("react"));
var _reactRedux = require("react-redux");
var _store = require("../redux/store");
var _react2 = require("redux-persist/integration/react");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function withReduxProvider(WrappedComponent) {
  return props => {
    return /*#__PURE__*/_react.default.createElement(_reactRedux.Provider, {
      store: _store.store
    }, /*#__PURE__*/_react.default.createElement(_react2.PersistGate, {
      loading: null,
      persistor: _store.StorePersist
    }, /*#__PURE__*/_react.default.createElement(WrappedComponent, props)));
  };
}
//# sourceMappingURL=withReduxProvider.js.map