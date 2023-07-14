import {configureStore} from '@reduxjs/toolkit';
import {persistStore} from 'redux-persist';
import indexReducer from './index.reducer';

export const Store = configureStore({
  reducer: indexReducer,
});

const StorePersist = persistStore(Store);

export default StorePersist;
