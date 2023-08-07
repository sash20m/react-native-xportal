import {store as reduxStore} from '../../redux/store';

export const selectWalletAddress = () => {
  const state = reduxStore.getState();
  return state.walletSlice.address;
};

export const selectWalletBalance = () => {
  const state = reduxStore.getState();
  return state.walletSlice.balance;
};
