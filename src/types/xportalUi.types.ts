import {StyleProp, ViewStyle} from 'react-native';
import {SignMessageParams, SignTransactionsParams} from './xPortal.types';
import {SignableMessage, Transaction} from '@multiversx/sdk-core/out';

export interface XPortalLoginProps {
  /**
   * If content is provided, the default content of the button (a text) will be replaced by the provided
   * content.
   */
  content?: React.ReactElement;

  /**
   * Style is provided in order to change the appearance of the whole button (main container of the button).
   */
  style?: StyleProp<ViewStyle>;
}

export interface XPortalLogoutProps {
  /**
   * If content is provided, the default content of the button (a text) will be replaced by the provided
   * content.
   */
  content?: React.ReactElement;

  /**
   * Style is provided in order to change the appearance of the whole button (main container of the button).
   */
  style?: StyleProp<ViewStyle>;
}

export interface XPortalSignTxProps extends SignTransactionsParams {
  /**
   * The callback is used to send back the response after the transaction/s have been signed.
   */
  callback: (res: Transaction[]) => void;

  /**
   * If content is provided, the default content of the button (a text) will be replaced by the provided
   * content.
   */
  content?: React.ReactElement;

  /**
   * Style is provided in order to change the appearance of the whole button (main container of the button).
   */
  style?: StyleProp<ViewStyle>;
}

export interface XPortalSignMessageProps extends SignMessageParams {
  /**
   * The callback is used to send back the response after the transaction/s have been signed.
   */
  callback: (res: SignableMessage) => void;

  /**
   * If content is provided, the default content of the button (a text) will be replaced by the provided
   * content.
   */
  content?: React.ReactElement;

  /**
   * Style is provided in order to change the appearance of the whole button (main container of the button).
   */
  style?: StyleProp<ViewStyle>;
}
