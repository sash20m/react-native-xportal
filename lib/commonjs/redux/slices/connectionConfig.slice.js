"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateConnectionConfig = exports.updateAccountLoading = exports.setConnectionConfig = exports.resetConnectionConfig = exports.default = exports.connectionConfigSlice = void 0;
var _toolkit = require("@reduxjs/toolkit");
var _commonActions = require("../commonActions");
/* eslint-disable @typescript-eslint/no-unused-vars */

const initialState = {
  connected: false
};
const connectionConfigSlice = (0, _toolkit.createSlice)({
  name: 'connectionConfigSlice',
  initialState,
  reducers: {
    setConnectionConfig: (state, action) => {
      return action.payload;
    },
    updateConnectionConfig: (state, action) => {
      return {
        ...state,
        ...action.payload
      };
    },
    resetConnectionConfig: state => {
      return initialState;
    },
    updateAccountLoading: (state, action) => {
      return {
        ...state,
        isAccountLoading: action.payload.isAccountLoading
      };
    }
  },
  extraReducers: builder => {
    builder.addCase(_commonActions.resetOnLogout, state => {
      return {
        ...initialState,
        chainId: state.chainId,
        projectId: state.projectId,
        connected: false
      };
    }).addCase(_commonActions.setConnectionOnLogin, (state, action) => {
      return {
        ...state,
        connected: true,
        isAccountLoading: false
      };
    });
  }
});
exports.connectionConfigSlice = connectionConfigSlice;
const {
  setConnectionConfig,
  updateConnectionConfig,
  resetConnectionConfig,
  updateAccountLoading
} = connectionConfigSlice.actions;
exports.updateAccountLoading = updateAccountLoading;
exports.resetConnectionConfig = resetConnectionConfig;
exports.updateConnectionConfig = updateConnectionConfig;
exports.setConnectionConfig = setConnectionConfig;
var _default = connectionConfigSlice.reducer;
exports.default = _default;
//# sourceMappingURL=connectionConfig.slice.js.map