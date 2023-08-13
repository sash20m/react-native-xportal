/// <reference types="redux-persist/types/persistreducer" />
/// <reference types="redux-persist/types/types" />
/// <reference types="redux-persist" />
export declare const store: import("@reduxjs/toolkit/dist/configureStore").ToolkitStore<import("redux").EmptyObject & {
    walletSlice: import("./slices/wallet.slice").WalletSlice;
    connectionConfigSlice: import("./slices/connectionConfig.slice").ConnectionConfigSlice;
} & import("redux-persist/es/persistReducer").PersistPartial, import("redux").AnyAction, import("@reduxjs/toolkit").MiddlewareArray<[import("@reduxjs/toolkit").ThunkMiddleware<import("redux").EmptyObject & {
    walletSlice: import("./slices/wallet.slice").WalletSlice;
    connectionConfigSlice: import("./slices/connectionConfig.slice").ConnectionConfigSlice;
} & import("redux-persist/es/persistReducer").PersistPartial, import("redux").AnyAction>]>>;
export declare const subscription: import("react-redux/es/utils/Subscription").Subscription;
export declare const StorePersist: import("redux-persist").Persistor;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
//# sourceMappingURL=store.d.ts.map