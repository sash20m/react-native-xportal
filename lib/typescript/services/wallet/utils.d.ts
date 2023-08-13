import { Transaction, TransactionPayload } from '@multiversx/sdk-core';
import Client from '@walletconnect/sign-client';
import { EngineTypes, SessionTypes, SignClientTypes } from '@walletconnect/types';
import BigNumber from 'bignumber.js';
import { SimpleTransactionType } from '../../types';
export interface ConnectParamsTypes {
    topic?: string;
    events?: SessionTypes.Namespace['events'];
    methods?: string[];
}
export interface TransactionResponse {
    signature: string;
    guardian?: string;
    guardianSignature?: string;
    options?: number;
    version?: number;
}
export interface CalculateFeeLimitType {
    gasLimit: string;
    gasPrice: string;
    data: string;
    gasPerDataByte: string;
    gasPriceModifier: string;
    chainId: string;
    minGasLimit?: string;
    defaultGasPrice?: string;
}
export declare function getCurrentSession(chainId: string, client?: Client): SessionTypes.Struct;
export declare function getCurrentTopic(chainId: string, client?: Client): SessionTypes.Struct['topic'];
export declare function getConnectionParams(chainId: string, options?: ConnectParamsTypes): EngineTypes.FindParams;
export declare function addressIsValid(destinationAddress: string): boolean;
export declare function getAddressFromSession(session: SessionTypes.Struct): string;
export declare function applyTransactionSignature({ transaction, response, }: {
    transaction: Transaction;
    response: TransactionResponse;
}): Transaction;
export declare function getMetadata(metadata?: SignClientTypes.Options['metadata']): {
    url: string;
    name: string;
    description: string;
    icons: string[];
    verifyUrl?: string | undefined;
    redirect?: {
        native?: string | undefined;
        universal?: string | undefined;
    } | undefined;
} | undefined;
export declare function calculateGasLimit({ data, isGuarded }: {
    data?: string;
    isGuarded?: boolean;
}): string;
export declare function createSignableTransactions(transactions: SimpleTransactionType[]): Promise<Transaction[]>;
export declare const getDataPayloadForTransaction: (data?: string) => TransactionPayload;
export declare function calcTotalFee(transactions: Transaction[], minGasLimit: number): BigNumber;
export declare function calculateFeeLimit({ minGasLimit, gasLimit, gasPrice, data: inputData, gasPerDataByte, gasPriceModifier, defaultGasPrice, chainId, }: CalculateFeeLimitType): string;
//# sourceMappingURL=utils.d.ts.map