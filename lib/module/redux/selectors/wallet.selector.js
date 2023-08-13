import { store as reduxStore } from '../../redux/store';
export const selectWalletAddress = () => {
  const state = reduxStore.getState();
  return state.walletSlice.address;
};
export const selectWalletBalance = () => {
  const state = reduxStore.getState();
  return state.walletSlice.balance;
};
export const selectAccount = () => {
  const state = reduxStore.getState().walletSlice;
  delete state.walletConnectSession;
  return state;
};
export const selectAccountTokens = () => {
  const state = reduxStore.getState();
  return state.walletSlice.tokens;
};
export const selectAccountBalance = () => {
  const state = reduxStore.getState();
  return state.walletSlice.balance;
};
//# sourceMappingURL=wallet.selector.js.map