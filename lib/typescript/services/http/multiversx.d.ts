import { MxAccount } from '../../types';
import { Tokens } from '../../redux/slices/wallet.slice';
/**
 * Obtains all the tokens for a given address
 */
export declare const getAccountTokens: (address: string) => Promise<Tokens[]>;
/**
 * Obtains the account information for a given address that is provided
 * by the multiversx api. This comes to complete the information that is
 * obtained from the wallet directly via walletconnect.
 */
export declare const getMxAccount: (address?: string) => Promise<MxAccount>;
//# sourceMappingURL=multiversx.d.ts.map