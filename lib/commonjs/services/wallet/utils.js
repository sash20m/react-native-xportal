"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addressIsValid = addressIsValid;
exports.applyTransactionSignature = applyTransactionSignature;
exports.calcTotalFee = calcTotalFee;
exports.calculateFeeLimit = calculateFeeLimit;
exports.calculateGasLimit = calculateGasLimit;
exports.createSignableTransactions = createSignableTransactions;
exports.getAddressFromSession = getAddressFromSession;
exports.getConnectionParams = getConnectionParams;
exports.getCurrentSession = getCurrentSession;
exports.getCurrentTopic = getCurrentTopic;
exports.getDataPayloadForTransaction = void 0;
exports.getMetadata = getMetadata;
var _sdkCore = require("@multiversx/sdk-core");
var _signature = require("@multiversx/sdk-core/out/signature");
var _utils = require("@walletconnect/utils");
var _bignumber = _interopRequireDefault(require("bignumber.js"));
var _sdkNetworkProviders = require("@multiversx/sdk-network-providers");
var _constants = require("./constants");
var _errors = require("./errors");
var _logger = require("./logger");
var _operation = require("./operation");
var _gas = require("../../constants/gas");
var _wallet = require("../../redux/selectors/wallet.selector");
var _multiversx = require("../http/multiversx");
var _connectionConfig = require("../../redux/selectors/connectionConfig.selector");
var _buffer = require("buffer");
var _stringsUtils = require("../../utils/stringsUtils");
var _wallet2 = require("../../redux/slices/wallet.slice");
var _store = require("../../redux/store");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/* eslint-disable @typescript-eslint/no-unused-vars */

function getCurrentSession(chainId, client) {
  if (!client) {
    throw new Error(_errors.WalletConnectProviderErrorMessagesEnum.notInitialized);
  }
  const acknowledgedSessions = client.find(getConnectionParams(chainId)).filter(s => s.acknowledged);
  if (acknowledgedSessions.length > 0) {
    const lastKeyIndex = acknowledgedSessions.length - 1;
    const session = acknowledgedSessions[lastKeyIndex];
    return session;
  }
  if (client.session.length > 0) {
    const lastKeyIndex = client.session.keys.length - 1;
    const session = client.session.get(client.session.keys[lastKeyIndex]);
    return session;
  }
  _logger.Logger.error(_errors.WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
  throw new Error(_errors.WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
}
function getCurrentTopic(chainId, client) {
  if (!client) {
    throw new Error(_errors.WalletConnectProviderErrorMessagesEnum.notInitialized);
  }
  const session = getCurrentSession(chainId, client);
  if (!(session !== null && session !== void 0 && session.topic)) {
    throw new Error(_errors.WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
  }
  return session.topic;
}
function getConnectionParams(chainId, options) {
  var _options$methods;
  const methods = [..._constants.WALLETCONNECT_MULTIVERSX_METHODS, ...((options === null || options === void 0 ? void 0 : options.methods) ?? [])];
  if (!(options !== null && options !== void 0 && (_options$methods = options.methods) !== null && _options$methods !== void 0 && _options$methods.includes(_operation.OptionalOperation.SIGN_LOGIN_TOKEN))) {
    methods.push(_operation.OptionalOperation.SIGN_LOGIN_TOKEN);
  }
  const chains = [`${_constants.WALLETCONNECT_MULTIVERSX_NAMESPACE}:${chainId}`];
  const events = (options === null || options === void 0 ? void 0 : options.events) ?? [];
  return {
    requiredNamespaces: {
      [_constants.WALLETCONNECT_MULTIVERSX_NAMESPACE]: {
        methods,
        chains,
        events
      }
    }
  };
}
function addressIsValid(destinationAddress) {
  try {
    const address = _sdkCore.Address.fromBech32(destinationAddress);
    return !address.isEmpty();
  } catch {
    return false;
  }
}
function getAddressFromSession(session) {
  const selectedNamespace = session.namespaces[_constants.WALLETCONNECT_MULTIVERSX_NAMESPACE];
  if (selectedNamespace && selectedNamespace.accounts) {
    // Use only the first address in case of multiple provided addresses
    const currentSession = selectedNamespace.accounts[0];
    const [namespace, reference, address] = currentSession.split(':');
    return address;
  }
  return '';
}
function applyTransactionSignature(_ref) {
  let {
    transaction,
    response
  } = _ref;
  if (!response) {
    _logger.Logger.error(_errors.WalletConnectProviderErrorMessagesEnum.invalidTransactionResponse);
    throw new Error(_errors.WalletConnectProviderErrorMessagesEnum.invalidTransactionResponse);
  }
  const {
    signature,
    guardianSignature,
    version,
    options,
    guardian
  } = response;
  const transactionGuardian = transaction.getGuardian().bech32();
  if (transactionGuardian && transactionGuardian !== guardian) {
    _logger.Logger.error(_errors.WalletConnectProviderErrorMessagesEnum.invalidGuardian);
    throw new Error(_errors.WalletConnectProviderErrorMessagesEnum.invalidGuardian);
  }
  if (guardian) {
    transaction.setGuardian(_sdkCore.Address.fromBech32(guardian));
  }
  if (version) {
    transaction.setVersion(version);
  }
  if (options != null) {
    transaction.setOptions(options);
  }
  transaction.applySignature(new _signature.Signature(signature));
  if (guardianSignature) {
    transaction.applyGuardianSignature(new _signature.Signature(guardianSignature));
  }
  return transaction;
}
function getMetadata(metadata) {
  if (metadata) {
    return {
      ...metadata,
      url: (0, _utils.getAppMetadata)().url
    };
  }
  return;
}
function calculateGasLimit(_ref2) {
  let {
    data,
    isGuarded
  } = _ref2;
  const guardedAccountGasLimit = isGuarded ? _gas.EXTRA_GAS_LIMIT_GUARDED_TX : 0;
  const bNconfigGasLimit = new _bignumber.default(_gas.GAS_LIMIT).plus(guardedAccountGasLimit);
  const bNgasPerDataByte = new _bignumber.default(_gas.GAS_PER_DATA_BYTE);
  const bNgasValue = data ? bNgasPerDataByte.times(_buffer.Buffer.from(data).length) : 0;
  const bNgasLimit = bNconfigGasLimit.plus(bNgasValue);
  const gasLimit = bNgasLimit.toString(10);
  return gasLimit;
}
async function createSignableTransactions(transactions) {
  const address = (0, _wallet.selectWalletAddress)();
  const account = await (0, _multiversx.getMxAccount)(address);
  const accountNonce = (account === null || account === void 0 ? void 0 : account.nonce) || 0;
  let highestNonce = accountNonce;
  const signableTransactions = transactions.map((tx, index) => {
    const {
      value,
      receiver,
      data = '',
      chainId,
      version = 1,
      options,
      gasPrice = _gas.GAS_PRICE,
      gasLimit = calculateGasLimit({
        data: tx.data,
        isGuarded: account === null || account === void 0 ? void 0 : account.isGuarded
      }),
      guardian,
      guardianSignature,
      nonce = accountNonce ? accountNonce + index : 0
    } = tx;
    let validatedReceiver = receiver;
    try {
      const addr = new _sdkCore.Address(receiver);
      validatedReceiver = addr.hex();
    } catch (err) {
      console.warn('Invalid receiver');
    }
    const storeChainId = (0, _connectionConfig.selectChainID)() || 'd';
    const txChainId = (chainId === null || chainId === void 0 ? void 0 : chainId.toString().toLowerCase()) || null;
    if (txChainId && txChainId !== storeChainId) {
      throw Error(`The ChainId for the transaction with nonce=${nonce}, is not the same as walletconnect's chainId`);
    }
    if (nonce > highestNonce) {
      highestNonce = nonce;
    }
    return newTransaction({
      value,
      receiver: validatedReceiver,
      data,
      gasPrice,
      gasLimit: Number(gasLimit),
      nonce: Number(nonce.valueOf().toString()),
      sender: new _sdkCore.Address(address).hex(),
      chainID: storeChainId,
      version,
      options,
      guardian,
      guardianSignature
    });
  });
  await _store.store.dispatch((0, _wallet2.updateWallet)({
    nonce: highestNonce
  }));
  return signableTransactions;
}
function newTransaction(rawTransaction) {
  const transaction = new _sdkCore.Transaction({
    value: rawTransaction.value.valueOf(),
    data: getDataPayloadForTransaction(rawTransaction.data),
    nonce: rawTransaction.nonce.valueOf(),
    receiver: new _sdkCore.Address(rawTransaction.receiver),
    sender: new _sdkCore.Address(rawTransaction.sender),
    gasLimit: rawTransaction.gasLimit.valueOf() ?? _gas.GAS_LIMIT,
    gasPrice: rawTransaction.gasPrice.valueOf() ?? _gas.GAS_PRICE,
    chainID: rawTransaction.chainID.valueOf(),
    version: new _sdkCore.TransactionVersion(rawTransaction.version ?? _gas.VERSION),
    ...(rawTransaction.options ? {
      options: new _sdkCore.TransactionOptions(rawTransaction.options)
    } : {}),
    ...(rawTransaction.guardian ? {
      guardian: new _sdkCore.Address(rawTransaction.guardian)
    } : {})
  });
  if (rawTransaction !== null && rawTransaction !== void 0 && rawTransaction.guardianSignature) {
    transaction.applyGuardianSignature(_buffer.Buffer.from(rawTransaction.guardianSignature, 'hex'));
  }
  if (rawTransaction !== null && rawTransaction !== void 0 && rawTransaction.signature) {
    transaction.applySignature(_buffer.Buffer.from(rawTransaction.signature, 'hex'));
  }
  return transaction;
}
const getDataPayloadForTransaction = data => {
  const defaultData = data ?? '';
  return (0, _stringsUtils.isStringBase64)(defaultData) ? _sdkCore.TransactionPayload.fromEncoded(defaultData) : new _sdkCore.TransactionPayload(defaultData);
};
exports.getDataPayloadForTransaction = getDataPayloadForTransaction;
function calcTotalFee(transactions, minGasLimit) {
  let totalFee = new _bignumber.default(0);
  transactions.forEach(tx => {
    const fee = calculateFeeLimit({
      gasPerDataByte: String(_gas.GAS_PER_DATA_BYTE),
      gasPriceModifier: String(_gas.GAS_PRICE_MODIFIER),
      minGasLimit: String(minGasLimit),
      gasLimit: tx.getGasLimit().valueOf().toString(),
      gasPrice: tx.getGasPrice().valueOf().toString(),
      data: tx.getData().toString(),
      chainId: tx.getChainID().valueOf()
    });
    totalFee = totalFee.plus(new _bignumber.default(fee));
  });
  return totalFee;
}
const placeholderData = {
  from: 'erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa',
  to: 'erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa'
};
function calculateFeeLimit(_ref3) {
  let {
    minGasLimit = String(_gas.GAS_LIMIT),
    gasLimit,
    gasPrice,
    data: inputData,
    gasPerDataByte,
    gasPriceModifier,
    defaultGasPrice = String(_gas.GAS_PRICE),
    chainId
  } = _ref3;
  const data = inputData || '';
  const validGasLimit = (0, _stringsUtils.stringIsInteger)(gasLimit) ? gasLimit : minGasLimit;
  const validGasPrice = (0, _stringsUtils.stringIsFloat)(gasPrice) ? gasPrice : defaultGasPrice;
  const transaction = new _sdkCore.Transaction({
    nonce: 0,
    value: _sdkCore.TokenPayment.egldFromAmount('0'),
    receiver: new _sdkCore.Address(placeholderData.to),
    sender: new _sdkCore.Address(placeholderData.to),
    gasPrice: parseInt(validGasPrice),
    gasLimit: parseInt(validGasLimit),
    data: new _sdkCore.TransactionPayload(data.trim()),
    chainID: chainId,
    version: new _sdkCore.TransactionVersion(1)
  });
  const networkConfig = new _sdkNetworkProviders.NetworkConfig();
  networkConfig.MinGasLimit = parseInt(minGasLimit);
  networkConfig.GasPerDataByte = parseInt(gasPerDataByte);
  networkConfig.GasPriceModifier = parseFloat(gasPriceModifier);
  try {
    const bNfee = transaction.computeFee(networkConfig);
    const fee = bNfee.toString(10);
    return fee;
  } catch (err) {
    return '0';
  }
}
//# sourceMappingURL=utils.js.map