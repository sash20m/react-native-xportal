import {configureStore} from '@reduxjs/toolkit';
import {persistStore} from 'redux-persist';
import indexReducer from './index.reducer';

export const Store = configureStore({
  reducer: indexReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

const StorePersist = persistStore(Store);

export default StorePersist;
