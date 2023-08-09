import {Linking, Platform} from 'react-native';
import {
  getEncodedXPortalLoginSchemaUrl,
  getXPortalSchemaUrl,
} from '../services/wallet/xportalDeeplink';

export const openXPortalForLogin = (connectorUri: string | undefined): void => {
  try {
    const encodedSchemaUrl = getEncodedXPortalLoginSchemaUrl(connectorUri);
    console.log('[encodedSchemaUrl]', encodedSchemaUrl);

    Linking.canOpenURL(encodedSchemaUrl)
      .then(supported => {
        if (supported || Platform.OS === 'android') {
          return Linking.openURL(encodedSchemaUrl);
        }
      })
      .catch(err => console.log(err));
  } catch (error) {
    throw Error('Could not open XPortal');
  }
};

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
    throw Error('Could not open XPortal');
  }
};
