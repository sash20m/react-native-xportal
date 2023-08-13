/// <reference types="redux-persist/types/persistreducer" />
import { WalletSlice } from './slices/wallet.slice';
import { ConnectionConfigSlice } from './slices/connectionConfig.slice';
export interface ReduxStateSlices {
    walletSlice: WalletSlice;
    connectionConfigSlice: ConnectionConfigSlice;
}
declare const _default: import("redux").Reducer<import("redux").EmptyObject & {
    walletSlice: WalletSlice;
    connectionConfigSlice: ConnectionConfigSlice;
} & import("redux-persist/es/persistReducer").PersistPartial, import("redux").AnyAction>;
export default _default;
//# sourceMappingURL=index.reducer.d.ts.map