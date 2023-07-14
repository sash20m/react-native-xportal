/* eslint-disable @typescript-eslint/no-unused-vars */
import {SessionTypes} from '@walletconnect/types/dist/types/sign-client/session';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {resetOnLogout} from '../commonActions';

export interface WalletSlice {
  address?: string;
  walletConnectSession?: SessionTypes.Struct;
  balance?: any;
  publickey?: string;
}

const initialState: WalletSlice = {};

export const walletSlice = createSlice({
  name: 'walletSlice',
  initialState,
  reducers: {
    setWallet: (state: WalletSlice, action: PayloadAction<WalletSlice>) => {
      state = action.payload;
    },
    updateWallet: (state: WalletSlice, action: PayloadAction<WalletSlice>) => {
      state = {...state, ...action.payload};
    },
    resetWallet: (state: WalletSlice) => {
      state = initialState;
    },
  },
  extraReducers: builder => {
    builder.addCase(resetOnLogout, () => {
      return initialState;
    });
  },
});

export const {setWallet, updateWallet, resetWallet} = walletSlice.actions;

export default walletSlice.reducer;