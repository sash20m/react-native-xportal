/* eslint-disable @typescript-eslint/no-unused-vars */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {resetOnLogout, setConnectionOnLogin} from '../commonActions';
import {ChainEnum} from '../../types';

export interface ConnectionConfigSlice {
  connected?: boolean;
  isAccountLoading?: boolean;
  chainId?: '1' | 't' | 'd' | ChainEnum;
  projectId?: string;
}

const initialState: ConnectionConfigSlice = {};

export const connectionConfigSlice = createSlice({
  name: 'connectionConfigSlice',
  initialState,
  reducers: {
    setConnectionConfig: (
      state: ConnectionConfigSlice,
      action: PayloadAction<ConnectionConfigSlice>,
    ) => {
      return action.payload;
    },
    updateConnectionConfig: (
      state: ConnectionConfigSlice,
      action: PayloadAction<ConnectionConfigSlice>,
    ) => {
      return {...state, ...action.payload};
    },
    resetConnectionConfig: (state: ConnectionConfigSlice) => {
      return initialState;
    },
    updateAccountLoading: (
      state: ConnectionConfigSlice,
      action: PayloadAction<ConnectionConfigSlice>,
    ) => {
      console.log(action, ' e?');
      return {...state, isAccountLoading: action.payload.isAccountLoading};
    },
  },
  extraReducers: builder => {
    builder
      .addCase(resetOnLogout, (state: ConnectionConfigSlice) => {
        return {
          ...initialState,
          chainId: state.chainId,
          projectId: state.projectId,
        };
      })
      .addCase(
        setConnectionOnLogin,
        (
          state: ConnectionConfigSlice,
          action: PayloadAction<ConnectionConfigSlice>,
        ) => {
          return {
            ...state,
            connected: true,
            isAccountLoading: false,
          };
        },
      );
  },
});

export const {
  setConnectionConfig,
  updateConnectionConfig,
  resetConnectionConfig,
  updateAccountLoading,
} = connectionConfigSlice.actions;

export default connectionConfigSlice.reducer;
