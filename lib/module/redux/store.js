import { configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistStore } from 'redux-persist';
import indexReducer from './index.reducer';
import { createSubscription } from 'react-redux/es/utils/Subscription';
export const store = configureStore({
  reducer: indexReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
    }
  })
});
export const subscription = createSubscription(store);
export const StorePersist = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
//# sourceMappingURL=store.js.map