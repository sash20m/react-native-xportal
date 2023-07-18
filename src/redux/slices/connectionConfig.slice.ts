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
  },
  extraReducers: builder => {
    builder.addCase(resetOnLogout, (state: ConnectionConfigSlice) => {
      return {
        ...initialState,
        chain: state.chain,
        projectId: state.projectId,
      };
    });
  },
});

export const {
  setConnectionConfig,
  updateConnectionConfig,
  resetConnectionConfig,
} = connectionConfigSlice.actions;

export default connectionConfigSlice.reducer;
