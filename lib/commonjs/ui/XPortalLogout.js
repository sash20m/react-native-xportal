"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _XPortal = require("../core/XPortal");
var _withReduxProvider = _interopRequireDefault(require("../hocs/withReduxProvider"));
var _reactRedux = require("react-redux");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const XPortalLogout = _ref => {
  let {
    content,
    style
  } = _ref;
  const isConnected = (0, _reactRedux.useSelector)(state => state.connectionConfigSlice.connected);
  const [isLoading, setIsLoading] = (0, _react.useState)(false);
  const xPortalLogout = async () => {
    try {
      setIsLoading(true);
      await _XPortal.xPortalSingleton.logout();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }
  };
  return /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    style: [buttonStyle.container, style],
    onPress: xPortalLogout
  }, content ? content : /*#__PURE__*/_react.default.createElement(_reactNative.View, null, isLoading ? /*#__PURE__*/_react.default.createElement(_reactNative.ActivityIndicator, null) : /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: buttonStyle.text
  }, isConnected ? 'Disconnect' : 'Disconnected')));
};
var _default = (0, _withReduxProvider.default)(XPortalLogout);
exports.default = _default;
const buttonStyle = _reactNative.StyleSheet.create({
  container: {
    width: 160,
    height: 50,
    backgroundColor: '#23f7dd',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 15,
    fontWeight: '600'
  }
});
//# sourceMappingURL=XPortalLogout.js.map