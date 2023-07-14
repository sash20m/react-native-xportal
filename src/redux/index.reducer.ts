import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers} from '@reduxjs/toolkit';
import {persistReducer} from 'redux-persist';
import walletReducer, {WalletSlice} from './slices/wallet.slice';
import connectionConfigReducer, {
  ConnectionConfigSlice,
} from './slices/connectionConfig.slice';

export interface ReduxStateSlices {
  walletSlice: WalletSlice;
  connectionConfigSlice: ConnectionConfigSlice;
}

const reducers = combineReducers({
  walletSlice: walletReducer,
  connectionConfigSlice: connectionConfigReducer,
});

const persistConfig = {
  key: 'mx-xportal',
  storage: AsyncStorage,
};

export default persistReducer(persistConfig, reducers);