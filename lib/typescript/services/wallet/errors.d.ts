/**
 * The base class for exceptions (errors).
 */
export declare class Err extends Error {
    inner: Error | undefined;
    constructor(message: string, inner?: Error);
}
/**
 * Signals that a method is not yet implemented
 */
export declare class ErrNotImplemented extends Err {
    constructor();
}
/**
 * Signals a bad address.
 */
export declare class ErrBadAddress extends Err {
    constructor(value: string, inner?: Error);
}
/**
 * WalletConnect Error Messages
 */
export declare enum WalletConnectProviderErrorMessagesEnum {
    unableToInit = "WalletConnect is unable to init",
    notInitialized = "WalletConnect is not initialized",
    unableToConnect = "WalletConnect is unable to connect",
    unableToConnectExisting = "WalletConnect is unable to connect to existing pairing",
    unableToSignLoginToken = "WalletConnect could not sign login token",
    unableToSign = "WalletConnect could not sign the message",
    unableToLogin = "WalletConnect is unable to login",
    unableToHandleTopic = "WalletConnect: Unable to handle topic update",
    unableToHandleEvent = "WalletConnect: Unable to handle events",
    unableToHandleCleanup = "WalletConnect: Unable to handle cleanup",
    sessionNotConnected = "WalletConnect Session is not connected",
    sessionDeleted = "WalletConnect Session Deleted",
    sessionExpired = "WalletConnect Session Expired",
    alreadyLoggedOut = "WalletConnect: Already logged out",
    pingFailed = "WalletConnect Ping Failed",
    invalidAddress = "WalletConnect: Invalid address",
    requestDifferentChain = "WalletConnect: Request Chain Id different than Connection Chain Id",
    invalidMessageResponse = "WalletConnect could not sign the message",
    invalidMessageSignature = "WalletConnect: Invalid message signature",
    invalidTransactionResponse = "WalletConnect could not sign the transactions. Invalid signatures",
    invalidCustomRequestResponse = "WalletConnect could not send the custom request",
    transactionError = "Transaction canceled",
    connectionError = "WalletConnect could not establish a connection",
    invalidGuardian = "WalletConnect: Invalid Guardian"
}
//# sourceMappingURL=errors.d.ts.map