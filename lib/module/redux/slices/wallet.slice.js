/* eslint-disable @typescript-eslint/no-unused-vars */

import { createSlice } from '@reduxjs/toolkit';
import { resetOnLogout, setConnectionOnLogin } from '../commonActions';
const initialState = {};
export const walletSlice = createSlice({
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
    builder.addCase(resetOnLogout, () => {
      return initialState;
    }).addCase(setConnectionOnLogin, (state, action) => {
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
export const {
  setWallet,
  updateWallet,
  resetWallet
} = walletSlice.actions;
export default walletSlice.reducer;
//# sourceMappingURL=wallet.slice.js.map