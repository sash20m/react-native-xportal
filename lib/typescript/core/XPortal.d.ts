import { Tokens } from '../redux/slices/wallet.slice';
import { InitializeParams, AccountResponse, SendCustomRequestParams, SignMessageParams, SignTransactionsParams, WatchTransactionParams } from '../types/xPortal.types';
import { ITransactionStatus, SignableMessage, Transaction } from '@multiversx/sdk-core';
declare class XPortal {
    private relayUrl;
    constructor();
    getWalletAddress(): string | null;
    isConnected(): boolean;
    getFullAccountInfo(): AccountResponse;
    getAccountTokensList(): Tokens[] | undefined;
    getAccountBalance(): string | undefined;
    initialize({ chainId, projectId, metadata, callbacks, }: InitializeParams): Promise<boolean>;
    login(): Promise<Boolean>;
    logout(): Promise<Boolean>;
    signTransactions({ transactions, minGasLimit, }: SignTransactionsParams): Promise<Transaction[]>;
    signMessage({ message }: SignMessageParams): Promise<SignableMessage>;
    sendCustomRequest({ request }: SendCustomRequestParams): Promise<any>;
    ping(): Promise<boolean>;
    refreshAccountData(): Promise<AccountResponse>;
    watchTransaction({ transactionHash, withUpdateAccountData, pollingIntervalMilliseconds, timeoutMilliseconds, }: WatchTransactionParams): Promise<ITransactionStatus>;
    private enrichCallbacks;
}
export declare const xPortalSingleton: XPortal;
export {};
//# sourceMappingURL=XPortal.d.ts.map