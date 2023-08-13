import { InitializeParams, RefreshAccountResponse, SendCustomRequestParams, SignMessageParams, SignTransactionsParams, WatchTransactionParams } from '../types/xPortal.types';
import { ITransactionStatus, SignableMessage, Transaction } from '@multiversx/sdk-core';
declare class XPortal {
    private relayUrl;
    constructor();
    getWalletAddress(): string | null;
    isConnected(): boolean;
    getFullAccountInfo(): import("../redux/slices/wallet.slice").WalletSlice;
    getAccountTokensList(): {
        balance: string | undefined;
        tokens: import("../redux/slices/wallet.slice").Tokens[] | undefined;
    };
    getAccountBalance(): string | undefined;
    initialize({ chainId, projectId, metadata, callbacks, }: InitializeParams): Promise<boolean>;
    login(): Promise<Boolean>;
    logout(): Promise<Boolean>;
    signTransactions({ transactions, minGasLimit, }: SignTransactionsParams): Promise<Transaction[]>;
    signMessage({ message }: SignMessageParams): Promise<SignableMessage>;
    sendCustomRequest({ request }: SendCustomRequestParams): Promise<any>;
    ping(): Promise<boolean>;
    refreshAccountData(): Promise<RefreshAccountResponse>;
    watchTransaction({ transactionHash, withUpdateAccountData, pollingIntervalMilliseconds, timeoutMilliseconds, }: WatchTransactionParams): Promise<ITransactionStatus>;
    private enrichCallbacks;
}
export declare const xPortalSingleton: XPortal;
export {};
//# sourceMappingURL=XPortal.d.ts.map