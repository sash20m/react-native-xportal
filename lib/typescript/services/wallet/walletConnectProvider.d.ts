import { SignableMessage, Transaction } from '@multiversx/sdk-core';
import Client from '@walletconnect/sign-client';
import { EngineTypes, PairingTypes, SessionTypes, SignClientTypes } from '@walletconnect/types';
import { WalletConnectProviderErrorMessagesEnum } from './errors';
import { Operation, OptionalOperation } from './operation';
import { ConnectParamsTypes } from './utils';
interface SessionEventTypes {
    event: {
        name: string;
        data: any;
    };
    chainId: string;
}
export interface IClientConnect {
    onClientLogin: () => void;
    onClientLogout(): void;
    onClientEvent: (event: SessionEventTypes['event']) => void;
}
export type { PairingTypes, SessionTypes, SessionEventTypes, ConnectParamsTypes, EngineTypes, WalletConnectProviderErrorMessagesEnum, Operation, OptionalOperation, };
export declare class WalletConnectProvider {
    walletConnectRelay: string;
    walletConnectProjectId: string;
    chainId: string;
    address: string;
    signature: string;
    isInitializing: boolean;
    walletConnector: Client | undefined;
    session: SessionTypes.Struct | undefined;
    pairings: PairingTypes.Struct[] | undefined;
    processingTopic: string;
    options: SignClientTypes.Options | undefined;
    wasConnected: boolean;
    onClientConnect: IClientConnect;
    constructor(onClientConnect: IClientConnect, chainId: string, walletConnectRelay: string, walletConnectProjectId: string, options?: SignClientTypes.Options);
    reset(): void;
    /**
     * Initiates WalletConnect client.
     */
    init(): Promise<boolean>;
    reinitialize(): Promise<boolean>;
    /**
     * Returns true if init() was previously called successfully
     */
    isInitialized(): boolean;
    /**
     * Returns true if provider is initialized and a valid session is set
     */
    isConnected(): Promise<boolean>;
    connect(options?: ConnectParamsTypes): Promise<{
        uri?: string;
        approval: () => Promise<SessionTypes.Struct>;
    }>;
    login(options?: {
        approval?: () => Promise<SessionTypes.Struct>;
        token?: string;
    }): Promise<string>;
    /**
     * Mocks a logout request by returning true
     */
    logout(options?: {
        topic?: string;
    }): Promise<boolean>;
    /**
     * Fetches the WalletConnect address
     */
    getAddress(): Promise<string>;
    /**
     * Fetches the WalletConnect signature
     */
    getSignature(): Promise<string>;
    /**
     * Fetches the WalletConnect pairings
     */
    getPairings(): Promise<PairingTypes.Struct[] | undefined>;
    /**
     * Signs a message and returns it signed
     * @param message
     */
    signMessage(message: SignableMessage): Promise<SignableMessage>;
    /**
     * Signs a transaction and returns it signed
     * @param transaction
     */
    signTransaction(transaction: Transaction): Promise<Transaction>;
    /**
     * Signs an array of transactions and returns it signed
     * @param transactions
     */
    signTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    /**
     * Sends a custom request
     * @param request
     */
    sendCustomRequest(options?: {
        request: EngineTypes.RequestParams['request'];
    }): Promise<any>;
    /**
     * Ping helper
     */
    ping(): Promise<boolean>;
    private loginAccount;
    private onSessionConnected;
    private handleTopicUpdateEvent;
    private handleSessionEvents;
    private subscribeToEvents;
    private checkPersistedState;
    private cleanupPendingPairings;
}
//# sourceMappingURL=walletConnectProvider.d.ts.map