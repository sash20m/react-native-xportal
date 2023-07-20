import {SessionEventTypes} from '@multiversx/sdk-wallet-connect-provider/out';
import {
  setConnectionConfig,
  updateAccountLoading,
} from '../../redux/slices/connectionConfig.slice';
import {store as reduxStore} from '../../redux/store';
import {InitializeParams} from '../types/xPortal.types';
import {WalletConnectProvider} from '../../services/walletConnectProvider/walletConnectProvider';
import {Linking, Platform} from 'react-native';
import {getEncodedXPortalLoginSchemaUrl} from '../../services/walletConnectProvider/xportalDeeplink';
import {
  getWalletConnectProvider,
  setWalletConnectProvider,
} from '../connectionProvider';
import {resetOnLogout, setConnectionOnLogin} from '../../redux/commonActions';
import http from '../../services/http';

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
    const walletConnectProvider = getWalletConnectProvider();
    if (!walletConnectProvider) {
      return;
    }

    const {uri: connectorUri, approval} = await walletConnectProvider.connect();

    console.log(`[connectorUri]=${connectorUri}`);

    const encodedSchemaUrl = getEncodedXPortalLoginSchemaUrl(connectorUri);
    Linking.canOpenURL(encodedSchemaUrl)
      .then(supported => {
        if (supported || Platform.OS === 'android') {
          return Linking.openURL(encodedSchemaUrl);
        }
      })
      .catch(err => console.log(err));

    await reduxStore.dispatch(updateAccountLoading({isAccountLoading: true}));
    try {
      await walletConnectProvider.login({approval});

      const tokens = await http.getAccountTokens(walletConnectProvider.address);
      await reduxStore.dispatch(
        setConnectionOnLogin({
          address: walletConnectProvider.address,
          tokens,
          walletConnectSession: walletConnectProvider.session,
        }),
      );

      setWalletConnectProvider(walletConnectProvider);
    } catch (error: any) {
      // throwError('Could not login with xPortal properly. Please try again');
    }
  }

  async logout() {
    const walletConnectProvider = getWalletConnectProvider();
    if (!walletConnectProvider) {
      return;
    }
    try {
      await walletConnectProvider.logout();
      await reduxStore.dispatch(resetOnLogout());
    } catch (error) {
      console.log('Could not log out');
    }
  }
}

// see about expiry in session

export const xPortalSingleton = new XPortal();
