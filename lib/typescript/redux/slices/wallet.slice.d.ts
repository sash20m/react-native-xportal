import { SessionTypes } from '@walletconnect/types/dist/types/sign-client/session';
import { PayloadAction } from '@reduxjs/toolkit';
import { MxAccount } from '../../types';
export interface Tokens {
    ticker: string;
    name: string;
    identifier: string;
    balance: number;
    valueUsd: number;
}
export interface WalletSlice extends MxAccount {
    address?: string;
    walletConnectSession?: SessionTypes.Struct;
    tokens?: Tokens[];
}
export declare const walletSlice: import("@reduxjs/toolkit").Slice<WalletSlice, {
    setWallet: (state: WalletSlice, action: PayloadAction<WalletSlice>) => WalletSlice;
    updateWallet: (state: WalletSlice, action: PayloadAction<WalletSlice>) => {
        address?: string | undefined;
        walletConnectSession?: SessionTypes.Struct | undefined;
        tokens?: Tokens[] | undefined;
        balance?: string | undefined;
        nonce?: number | undefined;
        txCount?: number | undefined;
        scrCount?: number | undefined;
        claimableRewards?: string | undefined;
        code?: string | undefined;
        username?: string | undefined;
        shard?: number | undefined;
        ownerAddress?: string | undefined;
        developerReward?: string | undefined;
        deployedAt?: number | undefined;
        scamInfo?: import("../../types").ScamInfoType | undefined;
        isUpgradeable?: boolean | undefined;
        isReadable?: boolean | undefined;
        isPayable?: boolean | undefined;
        isPayableBySmartContract?: boolean | undefined;
        assets?: import("../../types").AssetType | undefined;
        isGuarded?: boolean | undefined;
        activeGuardianActivationEpoch?: number | undefined;
        activeGuardianAddress?: string | undefined;
        activeGuardianServiceUid?: string | undefined;
        pendingGuardianActivationEpoch?: number | undefined;
        pendingGuardianAddress?: string | undefined;
        pendingGuardianServiceUid?: string | undefined;
    };
    resetWallet: (state: WalletSlice) => WalletSlice;
}, "walletSlice">;
export declare const setWallet: import("@reduxjs/toolkit").ActionCreatorWithPayload<WalletSlice, "walletSlice/setWallet">, updateWallet: import("@reduxjs/toolkit").ActionCreatorWithPayload<WalletSlice, "walletSlice/updateWallet">, resetWallet: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"walletSlice/resetWallet">;
declare const _default: import("redux").Reducer<WalletSlice>;
export default _default;
//# sourceMappingURL=wallet.slice.d.ts.map