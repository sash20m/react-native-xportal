import {store as reduxStore} from '../../redux/store';

export const selectChainID = async () => {
  const state = await reduxStore.getState();
  return state.connectionConfigSlice.chainId;
};
