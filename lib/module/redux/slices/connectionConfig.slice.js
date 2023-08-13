/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice } from '@reduxjs/toolkit';
import { resetOnLogout, setConnectionOnLogin } from '../commonActions';
const initialState = {
  connected: false
};
export const connectionConfigSlice = createSlice({
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
    builder.addCase(resetOnLogout, state => {
      return {
        ...initialState,
        chainId: state.chainId,
        projectId: state.projectId,
        connected: false
      };
    }).addCase(setConnectionOnLogin, (state, action) => {
      return {
        ...state,
        connected: true,
        isAccountLoading: false
      };
    });
  }
});
export const {
  setConnectionConfig,
  updateConnectionConfig,
  resetConnectionConfig,
  updateAccountLoading
} = connectionConfigSlice.actions;
export default connectionConfigSlice.reducer;
//# sourceMappingURL=connectionConfig.slice.js.map