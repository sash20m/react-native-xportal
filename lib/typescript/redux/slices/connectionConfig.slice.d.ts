import { PayloadAction } from '@reduxjs/toolkit';
import { ChainEnum } from '../../types';
export interface ConnectionConfigSlice {
    connected?: boolean;
    isAccountLoading?: boolean;
    chainId?: '1' | 't' | 'd' | ChainEnum;
    projectId?: string;
}
export declare const connectionConfigSlice: import("@reduxjs/toolkit").Slice<ConnectionConfigSlice, {
    setConnectionConfig: (state: ConnectionConfigSlice, action: PayloadAction<ConnectionConfigSlice>) => ConnectionConfigSlice;
    updateConnectionConfig: (state: ConnectionConfigSlice, action: PayloadAction<ConnectionConfigSlice>) => {
        connected?: boolean | undefined;
        isAccountLoading?: boolean | undefined;
        chainId?: "t" | "d" | "1" | ChainEnum | undefined;
        projectId?: string | undefined;
    };
    resetConnectionConfig: (state: ConnectionConfigSlice) => ConnectionConfigSlice;
    updateAccountLoading: (state: ConnectionConfigSlice, action: PayloadAction<ConnectionConfigSlice>) => {
        isAccountLoading: boolean | undefined;
        connected?: boolean | undefined;
        chainId?: "t" | "d" | "1" | ChainEnum | undefined;
        projectId?: string | undefined;
    };
}, "connectionConfigSlice">;
export declare const setConnectionConfig: import("@reduxjs/toolkit").ActionCreatorWithPayload<ConnectionConfigSlice, "connectionConfigSlice/setConnectionConfig">, updateConnectionConfig: import("@reduxjs/toolkit").ActionCreatorWithPayload<ConnectionConfigSlice, "connectionConfigSlice/updateConnectionConfig">, resetConnectionConfig: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"connectionConfigSlice/resetConnectionConfig">, updateAccountLoading: import("@reduxjs/toolkit").ActionCreatorWithPayload<ConnectionConfigSlice, "connectionConfigSlice/updateAccountLoading">;
declare const _default: import("redux").Reducer<ConnectionConfigSlice>;
export default _default;
//# sourceMappingURL=connectionConfig.slice.d.ts.map