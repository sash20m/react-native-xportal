"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.walletSlice = exports.updateWallet = exports.setWallet = exports.resetWallet = exports.default = void 0;
var _toolkit = require("@reduxjs/toolkit");
var _commonActions = require("../commonActions");
/* eslint-disable @typescript-eslint/no-unused-vars */

const initialState = {};
const walletSlice = (0, _toolkit.createSlice)({
  name: 'walletSlice',
  initialState,
  reducers: {
    setWallet: (state, action) => {
      return action.payload;
    },
    updateWallet: (state, action) => {
      return {
        ...state,
        ...action.payload
      };
    },
    resetWallet: state => {
      return initialState;
    }
  },
  extraReducers: builder => {
    builder.addCase(_commonActions.resetOnLogout, () => {
      return initialState;
    }).addCase(_commonActions.setConnectionOnLogin, (state, action) => {
      return {
        ...state,
        address: action.payload.address,
        tokens: action.payload.tokens,
        walletConnectSession: action.payload.walletConnectSession,
        ...action.payload
      };
    });
  }
});
exports.walletSlice = walletSlice;
const {
  setWallet,
  updateWallet,
  resetWallet
} = walletSlice.actions;
exports.resetWallet = resetWallet;
exports.updateWallet = updateWallet;
exports.setWallet = setWallet;
var _default = walletSlice.reducer;
exports.default = _default;
//# sourceMappingURL=wallet.slice.js.map