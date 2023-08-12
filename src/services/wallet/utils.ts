/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Address,
  IPlainTransactionObject,
  TokenPayment,
  Transaction,
  TransactionOptions,
  TransactionPayload,
  TransactionVersion,
} from '@multiversx/sdk-core';
import { Signature } from '@multiversx/sdk-core/out/signature';
import Client from '@walletconnect/sign-client';
import { getAppMetadata } from '@walletconnect/utils';
import { EngineTypes, SessionTypes, SignClientTypes } from '@walletconnect/types';
import BigNumber from 'bignumber.js';
import { NetworkConfig } from '@multiversx/sdk-network-providers';

import { WALLETCONNECT_MULTIVERSX_METHODS, WALLETCONNECT_MULTIVERSX_NAMESPACE } from './constants';
import { WalletConnectProviderErrorMessagesEnum } from './errors';
import { Logger } from './logger';
import { OptionalOperation } from './operation';
import {
  EXTRA_GAS_LIMIT_GUARDED_TX,
  GAS_LIMIT,
  GAS_PER_DATA_BYTE,
  GAS_PRICE,
  GAS_PRICE_MODIFIER,
  VERSION,
} from '../../constants/gas';
import { selectWalletAddress } from '../../redux/selectors/wallet.selector';
import { getMxAccount } from '../http/multiversx';
import { SimpleTransactionType } from '../../types';
import { selectChainID } from '../../redux/selectors/connectionConfig.selector';
import { Buffer } from 'buffer';
import { isStringBase64, stringIsFloat, stringIsInteger } from '../../utils/stringsUtils';
import { updateWallet } from '../../redux/slices/wallet.slice';
import { store as reduxStore } from '../../redux/store';

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

export function getCurrentSession(chainId: string, client?: Client): SessionTypes.Struct {
  if (!client) {
    throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
  }

  const acknowledgedSessions = client
    .find(getConnectionParams(chainId))
    .filter((s) => s.acknowledged);

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

  Logger.error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
  throw new Error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
}

export function getCurrentTopic(chainId: string, client?: Client): SessionTypes.Struct['topic'] {
  if (!client) {
    throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
  }

  const session = getCurrentSession(chainId, client);
  if (!session?.topic) {
    throw new Error(WalletConnectProviderErrorMessagesEnum.sessionNotConnected);
  }

  return session.topic;
}

export function getConnectionParams(
  chainId: string,
  options?: ConnectParamsTypes
): EngineTypes.FindParams {
  const methods = [...WALLETCONNECT_MULTIVERSX_METHODS, ...(options?.methods ?? [])];
  if (!options?.methods?.includes(OptionalOperation.SIGN_LOGIN_TOKEN)) {
    methods.push(OptionalOperation.SIGN_LOGIN_TOKEN);
  }
  const chains = [`${WALLETCONNECT_MULTIVERSX_NAMESPACE}:${chainId}`];
  const events = options?.events ?? [];

  return {
    requiredNamespaces: {
      [WALLETCONNECT_MULTIVERSX_NAMESPACE]: {
        methods,
        chains,
        events,
      },
    },
  };
}

export function addressIsValid(destinationAddress: string): boolean {
  try {
    const address = Address.fromBech32(destinationAddress);
    return !address.isEmpty();
  } catch {
    return false;
  }
}

export function getAddressFromSession(session: SessionTypes.Struct): string {
  const selectedNamespace = session.namespaces[WALLETCONNECT_MULTIVERSX_NAMESPACE];

  if (selectedNamespace && selectedNamespace.accounts) {
    // Use only the first address in case of multiple provided addresses
    const currentSession = selectedNamespace.accounts[0];
    const [namespace, reference, address] = currentSession.split(':');

    return address;
  }

  return '';
}

export function applyTransactionSignature({
  transaction,
  response,
}: {
  transaction: Transaction;
  response: TransactionResponse;
}): Transaction {
  if (!response) {
    Logger.error(WalletConnectProviderErrorMessagesEnum.invalidTransactionResponse);
    throw new Error(WalletConnectProviderErrorMessagesEnum.invalidTransactionResponse);
  }

  const { signature, guardianSignature, version, options, guardian } = response;
  const transactionGuardian = transaction.getGuardian().bech32();

  if (transactionGuardian && transactionGuardian !== guardian) {
    Logger.error(WalletConnectProviderErrorMessagesEnum.invalidGuardian);
    throw new Error(WalletConnectProviderErrorMessagesEnum.invalidGuardian);
  }

  if (guardian) {
    transaction.setGuardian(Address.fromBech32(guardian));
  }

  if (version) {
    transaction.setVersion(version);
  }

  if (options != null) {
    transaction.setOptions(options);
  }

  transaction.applySignature(new Signature(signature));

  if (guardianSignature) {
    transaction.applyGuardianSignature(new Signature(guardianSignature));
  }

  return transaction;
}

export function getMetadata(metadata?: SignClientTypes.Options['metadata']) {
  if (metadata) {
    return { ...metadata, url: getAppMetadata().url };
  }

  return;
}

export function calculateGasLimit({ data, isGuarded }: { data?: string; isGuarded?: boolean }) {
  const guardedAccountGasLimit = isGuarded ? EXTRA_GAS_LIMIT_GUARDED_TX : 0;
  const bNconfigGasLimit = new BigNumber(GAS_LIMIT).plus(guardedAccountGasLimit);
  const bNgasPerDataByte = new BigNumber(GAS_PER_DATA_BYTE);
  const bNgasValue = data ? bNgasPerDataByte.times(Buffer.from(data).length) : 0;
  const bNgasLimit = bNconfigGasLimit.plus(bNgasValue);
  const gasLimit = bNgasLimit.toString(10);
  return gasLimit;
}

export async function createSignableTransactions(transactions: SimpleTransactionType[]) {
  const address = selectWalletAddress();
  const account = await getMxAccount(address);
  const accountNonce = account?.nonce || 0;
  let highestNonce = accountNonce;

  const signableTransactions = transactions.map((tx, index) => {
    const {
      value,
      receiver,
      data = '',
      chainId,
      version = 1,
      options,
      gasPrice = GAS_PRICE,
      gasLimit = calculateGasLimit({
        data: tx.data,
        isGuarded: account?.isGuarded,
      }),
      guardian,
      guardianSignature,
      nonce = accountNonce ? accountNonce + index : 0,
    } = tx;
    let validatedReceiver = receiver;

    try {
      const addr = new Address(receiver);
      validatedReceiver = addr.hex();
    } catch (err) {
      console.warn('Invalid receiver');
    }

    const storeChainId = selectChainID() || 'd';
    const txChainId = chainId?.toString().toLowerCase() || null;

    if (txChainId && txChainId !== storeChainId) {
      throw Error(
        `The ChainId for the transaction with nonce=${nonce}, is not the same as walletconnect's chainId`
      );
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
      sender: new Address(address).hex(),
      chainID: storeChainId,
      version,
      options,
      guardian,
      guardianSignature,
    });
  });

  await reduxStore.dispatch(updateWallet({ nonce: highestNonce }));

  return signableTransactions;
}

function newTransaction(rawTransaction: IPlainTransactionObject) {
  const transaction = new Transaction({
    value: rawTransaction.value.valueOf(),
    data: getDataPayloadForTransaction(rawTransaction.data),
    nonce: rawTransaction.nonce.valueOf(),
    receiver: new Address(rawTransaction.receiver),
    sender: new Address(rawTransaction.sender),
    gasLimit: rawTransaction.gasLimit.valueOf() ?? GAS_LIMIT,
    gasPrice: rawTransaction.gasPrice.valueOf() ?? GAS_PRICE,
    chainID: rawTransaction.chainID.valueOf(),
    version: new TransactionVersion(rawTransaction.version ?? VERSION),
    ...(rawTransaction.options ? { options: new TransactionOptions(rawTransaction.options) } : {}),
    ...(rawTransaction.guardian ? { guardian: new Address(rawTransaction.guardian) } : {}),
  });

  if (rawTransaction?.guardianSignature) {
    transaction.applyGuardianSignature(Buffer.from(rawTransaction.guardianSignature, 'hex'));
  }

  if (rawTransaction?.signature) {
    transaction.applySignature(Buffer.from(rawTransaction.signature, 'hex'));
  }

  return transaction;
}

export const getDataPayloadForTransaction = (data?: string): TransactionPayload => {
  const defaultData = data ?? '';

  return isStringBase64(defaultData)
    ? TransactionPayload.fromEncoded(defaultData)
    : new TransactionPayload(defaultData);
};

export function calcTotalFee(transactions: Transaction[], minGasLimit: number) {
  let totalFee = new BigNumber(0);

  transactions.forEach((tx) => {
    const fee = calculateFeeLimit({
      gasPerDataByte: String(GAS_PER_DATA_BYTE),
      gasPriceModifier: String(GAS_PRICE_MODIFIER),
      minGasLimit: String(minGasLimit),
      gasLimit: tx.getGasLimit().valueOf().toString(),
      gasPrice: tx.getGasPrice().valueOf().toString(),
      data: tx.getData().toString(),
      chainId: tx.getChainID().valueOf(),
    });
    totalFee = totalFee.plus(new BigNumber(fee));
  });

  return totalFee;
}

const placeholderData = {
  from: 'erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa',
  to: 'erd12dnfhej64s6c56ka369gkyj3hwv5ms0y5rxgsk2k7hkd2vuk7rvqxkalsa',
};
export function calculateFeeLimit({
  minGasLimit = String(GAS_LIMIT),
  gasLimit,
  gasPrice,
  data: inputData,
  gasPerDataByte,
  gasPriceModifier,
  defaultGasPrice = String(GAS_PRICE),
  chainId,
}: CalculateFeeLimitType) {
  const data = inputData || '';
  const validGasLimit = stringIsInteger(gasLimit) ? gasLimit : minGasLimit;
  const validGasPrice = stringIsFloat(gasPrice) ? gasPrice : defaultGasPrice;
  const transaction = new Transaction({
    nonce: 0,
    value: TokenPayment.egldFromAmount('0'),
    receiver: new Address(placeholderData.to),
    sender: new Address(placeholderData.to),
    gasPrice: parseInt(validGasPrice),
    gasLimit: parseInt(validGasLimit),
    data: new TransactionPayload(data.trim()),
    chainID: chainId,
    version: new TransactionVersion(1),
  });

  const networkConfig = new NetworkConfig();
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
