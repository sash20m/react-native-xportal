"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _asyncStorage = _interopRequireDefault(require("@react-native-async-storage/async-storage"));
var _reduxPersist = require("redux-persist");
var _wallet = _interopRequireDefault(require("./slices/wallet.slice"));
var _connectionConfig = _interopRequireDefault(require("./slices/connectionConfig.slice"));
var _redux = require("redux");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const reducers = (0, _redux.combineReducers)({
  walletSlice: _wallet.default,
  connectionConfigSlice: _connectionConfig.default
});
const persistConfig = {
  key: 'mx-xportal',
  storage: _asyncStorage.default
};
var _default = (0, _reduxPersist.persistReducer)(persistConfig, reducers); //this is indexReducer
exports.default = _default;
//# sourceMappingURL=index.reducer.js.map