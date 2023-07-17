import {ReduxStateSlices} from '../index.reducer';

export const selectConnectionConfig = (state: ReduxStateSlices) =>
  state.connectionConfigSlice;
