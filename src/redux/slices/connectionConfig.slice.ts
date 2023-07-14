/* eslint-disable @typescript-eslint/no-unused-vars */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {resetOnLogout} from '../commonActions';

export interface ConnectionConfigSlice {
  connected?: boolean;
  isAccountLoading?: boolean;
  chain?: string;
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
      state = action.payload;
    },
    updateConnectionConfig: (
      state: ConnectionConfigSlice,
      action: PayloadAction<ConnectionConfigSlice>,
    ) => {
      state = {...state, ...action.payload};
    },
    resetConnectionConfig: (state: ConnectionConfigSlice) => {
      state = initialState;
    },
  },
  extraReducers: builder => {
    builder.addCase(resetOnLogout, () => {
      return initialState;
    });
  },
});

export const {
  setConnectionConfig,
  updateConnectionConfig,
  resetConnectionConfig,
} = connectionConfigSlice.actions;

export default connectionConfigSlice.reducer;
