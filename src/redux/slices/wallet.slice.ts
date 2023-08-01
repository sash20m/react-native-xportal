/* eslint-disable @typescript-eslint/no-unused-vars */
import {SessionTypes} from '@walletconnect/types/dist/types/sign-client/session';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {resetOnLogout, setConnectionOnLogin} from '../commonActions';
import {MxAccount} from '../../types';

export interface Tokens {
  ticker: string;
  name: string;
  identifier: string;
  balance: number;
  valueUsd: number;
}
export interface WalletSlice extends MxAccount {
  address?: string;
  walletConnectSession?: SessionTypes.Struct;
  tokens?: Tokens;
}

const initialState: WalletSlice = {};

export const walletSlice = createSlice({
  name: 'walletSlice',
  initialState,
  reducers: {
    setWallet: (state: WalletSlice, action: PayloadAction<WalletSlice>) => {
      return action.payload;
    },
    updateWallet: (state: WalletSlice, action: PayloadAction<WalletSlice>) => {
      return {...state, ...action.payload};
    },
    resetWallet: (state: WalletSlice) => {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(resetOnLogout, () => {
        return initialState;
      })
      .addCase(
        setConnectionOnLogin,
        (state: WalletSlice, action: PayloadAction<WalletSlice>) => {
          return {
            ...state,
            address: action.payload.address,
            tokens: action.payload.tokens,
            walletConnectSession: action.payload.walletConnectSession,
            ...action.payload,
          };
        },
      );
  },
});

export const {setWallet, updateWallet, resetWallet} = walletSlice.actions;

export default walletSlice.reducer;
