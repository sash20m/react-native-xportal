"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WalletConnectProviderErrorMessagesEnum = exports.ErrNotImplemented = exports.ErrBadAddress = exports.Err = void 0;
/**
 * The base class for exceptions (errors).
 */
class Err extends Error {
  inner = undefined;
  constructor(message, inner) {
    super(message);
    this.inner = inner;
  }
}

/**
 * Signals that a method is not yet implemented
 */
exports.Err = Err;
class ErrNotImplemented extends Err {
  constructor() {
    super('Method not yet implemented');
  }
}

/**
 * Signals a bad address.
 */
exports.ErrNotImplemented = ErrNotImplemented;
class ErrBadAddress extends Err {
  constructor(value, inner) {
    super(`Bad address: ${value}`, inner);
  }
}

/**
 * WalletConnect Error Messages
 */
exports.ErrBadAddress = ErrBadAddress;
let WalletConnectProviderErrorMessagesEnum = /*#__PURE__*/function (WalletConnectProviderErrorMessagesEnum) {
  WalletConnectProviderErrorMessagesEnum["unableToInit"] = "WalletConnect is unable to init";
  WalletConnectProviderErrorMessagesEnum["notInitialized"] = "WalletConnect is not initialized";
  WalletConnectProviderErrorMessagesEnum["unableToConnect"] = "WalletConnect is unable to connect";
  WalletConnectProviderErrorMessagesEnum["unableToConnectExisting"] = "WalletConnect is unable to connect to existing pairing";
  WalletConnectProviderErrorMessagesEnum["unableToSignLoginToken"] = "WalletConnect could not sign login token";
  WalletConnectProviderErrorMessagesEnum["unableToSign"] = "WalletConnect could not sign the message";
  WalletConnectProviderErrorMessagesEnum["unableToLogin"] = "WalletConnect is unable to login";
  WalletConnectProviderErrorMessagesEnum["unableToHandleTopic"] = "WalletConnect: Unable to handle topic update";
  WalletConnectProviderErrorMessagesEnum["unableToHandleEvent"] = "WalletConnect: Unable to handle events";
  WalletConnectProviderErrorMessagesEnum["unableToHandleCleanup"] = "WalletConnect: Unable to handle cleanup";
  WalletConnectProviderErrorMessagesEnum["sessionNotConnected"] = "WalletConnect Session is not connected";
  WalletConnectProviderErrorMessagesEnum["sessionDeleted"] = "WalletConnect Session Deleted";
  WalletConnectProviderErrorMessagesEnum["sessionExpired"] = "WalletConnect Session Expired";
  WalletConnectProviderErrorMessagesEnum["alreadyLoggedOut"] = "WalletConnect: Already logged out";
  WalletConnectProviderErrorMessagesEnum["pingFailed"] = "WalletConnect Ping Failed";
  WalletConnectProviderErrorMessagesEnum["invalidAddress"] = "WalletConnect: Invalid address";
  WalletConnectProviderErrorMessagesEnum["requestDifferentChain"] = "WalletConnect: Request Chain Id different than Connection Chain Id";
  WalletConnectProviderErrorMessagesEnum["invalidMessageResponse"] = "WalletConnect could not sign the message";
  WalletConnectProviderErrorMessagesEnum["invalidMessageSignature"] = "WalletConnect: Invalid message signature";
  WalletConnectProviderErrorMessagesEnum["invalidTransactionResponse"] = "WalletConnect could not sign the transactions. Invalid signatures";
  WalletConnectProviderErrorMessagesEnum["invalidCustomRequestResponse"] = "WalletConnect could not send the custom request";
  WalletConnectProviderErrorMessagesEnum["transactionError"] = "Transaction canceled";
  WalletConnectProviderErrorMessagesEnum["connectionError"] = "WalletConnect could not establish a connection";
  WalletConnectProviderErrorMessagesEnum["invalidGuardian"] = "WalletConnect: Invalid Guardian";
  return WalletConnectProviderErrorMessagesEnum;
}({});
exports.WalletConnectProviderErrorMessagesEnum = WalletConnectProviderErrorMessagesEnum;
//# sourceMappingURL=errors.js.map