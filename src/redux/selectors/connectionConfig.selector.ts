import {store as reduxStore} from '../../redux/store';

export const selectChainID = () => {
  const state = reduxStore.getState();
  return state.connectionConfigSlice.chainId;
};
