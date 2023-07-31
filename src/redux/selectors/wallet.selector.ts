import {store as reduxStore} from '../../redux/store';

export const selectWalletAddress = async () => {
  const state = await reduxStore.getState();
  return state.walletSlice.address;
};
