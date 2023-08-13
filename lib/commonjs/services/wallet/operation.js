"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OptionalOperation = exports.Operation = void 0;
let Operation = /*#__PURE__*/function (Operation) {
  Operation["SIGN_TRANSACTION"] = "mvx_signTransaction";
  Operation["SIGN_TRANSACTIONS"] = "mvx_signTransactions";
  Operation["SIGN_MESSAGE"] = "mvx_signMessage";
  return Operation;
}({});
exports.Operation = Operation;
let OptionalOperation = /*#__PURE__*/function (OptionalOperation) {
  OptionalOperation["SIGN_LOGIN_TOKEN"] = "mvx_signLoginToken";
  OptionalOperation["SIGN_NATIVE_AUTH_TOKEN"] = "mvx_signNativeAuthToken";
  OptionalOperation["CANCEL_ACTION"] = "mvx_cancelAction";
  return OptionalOperation;
}({});
exports.OptionalOperation = OptionalOperation;
//# sourceMappingURL=operation.js.map