import {SessionEventTypes} from '@multiversx/sdk-wallet-connect-provider/out';
import {setConnectionConfig} from '../../redux/slices/connectionConfig.slice';
import {store as reduxStore} from '../../redux/store';
import {ConnectionMetadata, InitializeParams} from '../types/xPortal.types';
import {WalletConnectProvider} from '../walletConnectProvider/walletConnectProvider';
import {Linking, Platform} from 'react-native';
import {getEncodedXPortalLoginSchemaUrl} from '../walletConnectProvider/xportalDeeplink';
import {
  setWalletConnectProvider,
  walletConnectProvider,
} from '../connectionProvider';

class XPortal {
  relayUrl = 'wss://relay.walletconnect.com';

  constructor() {}

  async initialize({
    chain,
    projectId,
    metadata,
  }: InitializeParams): Promise<boolean> {
    console.log(chain, projectId, ' e?');
    await reduxStore.dispatch(setConnectionConfig({chain, projectId}));

    const store = await this.getStoreState();
    const callbacks = {
      onClientLogin: async () => {
        console.log('on login');
      },
      onClientLogout: async () => {
        console.log('on logout');
      },
      onClientEvent: async (event: SessionEventTypes['event']) => {
        console.log('event -> ', event);
      },
    };

    const connectionProjectId = store.connectionConfigSlice.projectId || '';
    const connectionChain = store.connectionConfigSlice.chain || '';
    const options = metadata ? {metadata} : {};

    const connectionProvider = new WalletConnectProvider(
      callbacks,
      connectionChain,
      this.relayUrl,
      connectionProjectId,
      options,
    );

    await connectionProvider.init();

    setWalletConnectProvider(connectionProvider);

    return true;
  }

  async getStoreState() {
    const state = await reduxStore.getState();
    return state;
  }

  async login() {
    if (!walletConnectProvider) {
      return;
    }

    const {uri: connectorUri, approval} = await walletConnectProvider.connect();

    console.log(`[connectorUri]=${connectorUri}`);

    // if (!connectorUri) {
    //   //   flashInformation(
    //   //     'Wallet Connect Provider did not provide a valid connector URI',
    //   //   );
    //   try {
    //     await walletConnector?.logout();
    //   } catch (error: any) {
    //     console.log(error);
    //   }
    //   return;
    // }

    const encodedSchemaUrl = getEncodedXPortalLoginSchemaUrl(connectorUri);
    Linking.canOpenURL(encodedSchemaUrl)
      .then(supported => {
        if (supported || Platform.OS === 'android') {
          return Linking.openURL(encodedSchemaUrl);
        }
      })
      .catch(err => console.log(err));

    try {
      await walletConnectProvider.login({approval});
    } catch (error: any) {
      // throwError('Could not login with xPortal properly. Please try again');
    }

    setWalletConnectProvider(walletConnectProvider);
  }
}

export const xPortalSingleton = new XPortal();
