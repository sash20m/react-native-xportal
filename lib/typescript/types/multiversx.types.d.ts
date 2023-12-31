export interface NetworkType {
    id: string;
    chainId: string;
    name: string;
    egldLabel: string;
    decimals: string;
    digits: string;
    gasPerDataByte: string;
    walletConnectDeepLink: string;
    walletAddress: string;
    apiAddress: string;
    explorerAddress: string;
    apiTimeout: string;
}
export interface AssetType {
    name: string;
    description: string;
    tags: string[];
    iconPng?: string;
    iconSvg?: string;
}
export interface MxAccount {
    address?: string;
    balance?: string;
    nonce?: number;
    txCount?: number;
    scrCount?: number;
    claimableRewards?: string;
    code?: string;
    username?: string;
    shard?: number;
    ownerAddress?: string;
    developerReward?: string;
    deployedAt?: number;
    scamInfo?: ScamInfoType;
    isUpgradeable?: boolean;
    isReadable?: boolean;
    isPayable?: boolean;
    isPayableBySmartContract?: boolean;
    assets?: AssetType;
    isGuarded?: boolean;
    activeGuardianActivationEpoch?: number;
    activeGuardianAddress?: string;
    activeGuardianServiceUid?: string;
    pendingGuardianActivationEpoch?: number;
    pendingGuardianAddress?: string;
    pendingGuardianServiceUid?: string;
}
export interface ScamInfoType {
    type: string;
    info: string;
}
export interface SimpleTransactionType {
    value: string;
    receiver: string;
    data?: string;
    gasPrice?: number;
    gasLimit?: number;
    chainId: string;
    version?: number;
    options?: number;
    guardian?: string;
    guardianSignature?: string;
    nonce: number;
}
export interface ITransactionWatcherTransaction {
    getHash(): {
        hex(): string;
    };
}
//# sourceMappingURL=multiversx.types.d.ts.map