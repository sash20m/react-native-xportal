import {Linking, Platform} from 'react-native';
import {
  getEncodedXPortalLoginSchemaUrl,
  getXPortalSchemaUrl,
} from '../services/wallet/xportalDeeplink';
import {ERROR_MESSAGES} from '../constants/errorMessages';
import {errorComposer} from './errorComposer';

/**
 * Opens XPortal with the intent to show the approve/cancel connection
 * screen with the DAPP.
 */
export const openXPortalForLogin = (connectorUri: string | undefined): void => {
  try {
    const encodedSchemaUrl = getEncodedXPortalLoginSchemaUrl(connectorUri);

    Linking.canOpenURL(encodedSchemaUrl)
      .then(supported => {
        if (supported || Platform.OS === 'android') {
          return Linking.openURL(encodedSchemaUrl);
        }
      })
      .catch(err => console.log(err));
  } catch (error) {
    throw new Error(
      errorComposer({
        message: ERROR_MESSAGES.XPORTAL_OPEN_FAIL,
        data: error,
      }),
    );
  }
};

/**
 * Simply redirects the user to XPortal by opening it or switching to it
 * on the phone screen.
 */
export const openXPortal = () => {
  try {
    const encodedSchemaUrl = getXPortalSchemaUrl();
    Linking.canOpenURL(encodedSchemaUrl)
      .then(supported => {
        if (supported || Platform.OS === 'android') {
          return Linking.openURL(encodedSchemaUrl);
        }
      })
      .catch(err => console.log(err));
  } catch (error) {
    throw new Error(
      errorComposer({
        message: ERROR_MESSAGES.XPORTAL_OPEN_FAIL,
        data: error,
      }),
    );
  }
};
