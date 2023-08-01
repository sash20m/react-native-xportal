/* eslint-disable @typescript-eslint/no-unused-vars */
import {Address, Transaction} from '@multiversx/sdk-core';
import {Signature} from '@multiversx/sdk-core/out/signature';
import Client from '@walletconnect/sign-client';
import {getAppMetadata} from '@walletconnect/utils';
import {EngineTypes, SessionTypes, SignClientTypes} from '@walletconnect/types';
import BigNumber from 'bignumber.js';

import {
  WALLETCONNECT_MULTIVERSX_METHODS,
  WALLETCONNECT_MULTIVERSX_NAMESPACE,
} from './constants';
import {WalletConnectProviderErrorMessagesEnum} from './errors';
import {Logger} from './logger';
import {OptionalOperation} from './operation';
import {
  EXTRA_GAS_LIMIT_GUARDED_TX,
  GAS_LIMIT,
  GAS_PER_DATA_BYTE,
} from '../../constants/gas';
import {selectWalletAddress} from '../../redux/selectors/wallet.selector';
import {getMxAccount} from '../http/multiversx';

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

export function getCurrentSession(
  chainId: string,
  client?: Client,
): SessionTypes.Struct {
  if (!client) {
    throw new Error(WalletConnectProviderErrorMessagesEnum.notInitialized);
  }

  const acknowledgedSessions = client
    .find(getConnectionParams(chainId))
    .filter(s => s.acknowledged);

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

export function getCurrentTopic(
  chainId: string,
  client?: Client,
): SessionTypes.Struct['topic'] {
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
  options?: ConnectParamsTypes,
): EngineTypes.FindParams {
  const methods = [
    ...WALLETCONNECT_MULTIVERSX_METHODS,
    ...(options?.methods ?? []),
  ];
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
  const selectedNamespace =
    session.namespaces[WALLETCONNECT_MULTIVERSX_NAMESPACE];

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
    Logger.error(
      WalletConnectProviderErrorMessagesEnum.invalidTransactionResponse,
    );
    throw new Error(
      WalletConnectProviderErrorMessagesEnum.invalidTransactionResponse,
    );
  }

  const {signature, guardianSignature, version, options, guardian} = response;
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
    return {...metadata, url: getAppMetadata().url};
  }

  return;
}

export function calculateGasLimit({
  data,
  isGuarded,
}: {
  data?: string;
  isGuarded?: boolean;
}) {
  const guardedAccountGasLimit = isGuarded ? EXTRA_GAS_LIMIT_GUARDED_TX : 0;
  const bNconfigGasLimit = new BigNumber(GAS_LIMIT).plus(
    guardedAccountGasLimit,
  );
  const bNgasPerDataByte = new BigNumber(GAS_PER_DATA_BYTE);
  const bNgasValue = data
    ? bNgasPerDataByte.times(Buffer.from(data).length)
    : 0;
  const bNgasLimit = bNconfigGasLimit.plus(bNgasValue);
  const gasLimit = bNgasLimit.toString(10);
  return gasLimit;
}

export async function createSignableTransactions() {
  //
  const address = await selectWalletAddress();
  const account = await getMxAccount(address);
  const accountNonce = account.nonce;

  //update account nonce in redux
}
