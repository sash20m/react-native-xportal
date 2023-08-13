import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';
import walletReducer from './slices/wallet.slice';
import connectionConfigReducer from './slices/connectionConfig.slice';
import { combineReducers } from 'redux';
const reducers = combineReducers({
  walletSlice: walletReducer,
  connectionConfigSlice: connectionConfigReducer
});
const persistConfig = {
  key: 'mx-xportal',
  storage: AsyncStorage
};
export default persistReducer(persistConfig, reducers); //this is indexReducer
//# sourceMappingURL=index.reducer.js.map