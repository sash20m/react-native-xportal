import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers} from '@reduxjs/toolkit';
import {persistReducer} from 'redux-persist';
import walletReducer, {WalletSlice} from './slices/wallet.slice';
import connectionConfigReducer, {
  ConnectionConfigSlice,
} from './slices/connectionConfig.slice';

export interface ReduxStateSlices {
  wallet: WalletSlice;
  connectionConfig: ConnectionConfigSlice;
}

const reducers = combineReducers({
  wallet: walletReducer,
  connectionConfig: connectionConfigReducer,
});

const persistConfig = {
  key: 'mx-xportal',
  storage: AsyncStorage,
};

export default persistReducer(persistConfig, reducers);
