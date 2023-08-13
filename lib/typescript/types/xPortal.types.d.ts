import { Transaction } from '@multiversx/sdk-core/out';
import { IClientConnect } from '../services/wallet/walletConnectProvider';
import { ChainEnum, MxAccount, SimpleTransactionType } from '../types';
import { EngineTypes } from '@walletconnect/types';
import { Tokens } from '../redux/slices/wallet.slice';
export interface ConnectionMetadata {
    description: string;
    url: string;
    icons: string[];
    name: string;
}
export interface InitializeParams {
    onLogin?: () => any;
    onLogout?: () => any;
    chainId: '1' | 't' | 'd' | ChainEnum;
    projectId: string;
    metadata: ConnectionMetadata;
    callbacks: IClientConnect;
}
export interface SignTransactionsParams {
    transactions: (Transaction | SimpleTransactionType)[];
    minGasLimit?: number;
}
export interface SignMessageParams {
    message: string;
}
export interface SendCustomRequestParams {
    request: EngineTypes.RequestParams['request'];
}
export interface WatchTransactionParams {
    transactionHash: string;
    pollingIntervalMilliseconds?: number;
    timeoutMilliseconds?: number;
    /**
     * Updates the data (balance, tokens, nonce etc) of the account currently logged in, if any exists.
     */
    withUpdateAccountData?: boolean;
}
export interface AccountResponse extends MxAccount {
    tokens: Tokens[];
}
export interface TokenList {
    balance: string | undefined;
    tokens: Tokens[] | undefined;
}
//# sourceMappingURL=xPortal.types.d.ts.map