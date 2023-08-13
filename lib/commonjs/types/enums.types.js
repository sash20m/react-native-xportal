"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LOGOUT_ACTION = exports.LOGIN_ACTION = exports.EnvironmentsEnum = exports.ChainEnum = void 0;
let ChainEnum = /*#__PURE__*/function (ChainEnum) {
  ChainEnum["TESTNET"] = "t";
  ChainEnum["DEVNET"] = "d";
  ChainEnum["MAINNET"] = "1";
  return ChainEnum;
}({});
exports.ChainEnum = ChainEnum;
let EnvironmentsEnum = /*#__PURE__*/function (EnvironmentsEnum) {
  EnvironmentsEnum["testnet"] = "testnet";
  EnvironmentsEnum["devnet"] = "devnet";
  EnvironmentsEnum["mainnet"] = "mainnet";
  return EnvironmentsEnum;
}({});
exports.EnvironmentsEnum = EnvironmentsEnum;
const LOGOUT_ACTION = 'logout_action';
exports.LOGOUT_ACTION = LOGOUT_ACTION;
const LOGIN_ACTION = 'login_action';
exports.LOGIN_ACTION = LOGIN_ACTION;
//# sourceMappingURL=enums.types.js.map