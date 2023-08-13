"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setConnectionOnLogin = exports.resetOnLogout = void 0;
var _toolkit = require("@reduxjs/toolkit");
var _types = require("../types");
const resetOnLogout = (0, _toolkit.createAction)(_types.LOGOUT_ACTION);
exports.resetOnLogout = resetOnLogout;
const setConnectionOnLogin = (0, _toolkit.createAction)(_types.LOGIN_ACTION, payload => ({
  payload
}));
exports.setConnectionOnLogin = setConnectionOnLogin;
//# sourceMappingURL=commonActions.js.map