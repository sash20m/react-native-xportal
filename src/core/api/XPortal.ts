import {
  setConnectionConfig,
  updateAccountLoading,
} from '../../redux/slices/connectionConfig.slice';
import {store as reduxStore} from '../../redux/store';
import {InitializeParams} from '../types/xPortal.types';
import {WalletConnectProvider} from '../../services/walletConnectProvider/walletConnectProvider';
import {
  getWalletConnectProvider,
  setWalletConnectProvider,
} from '../connectionProvider';
import {resetOnLogout, setConnectionOnLogin} from '../../redux/commonActions';
import http from '../../services/http';
import {openXPortal, openXPortalForLogin} from '../../utils/openXPortal';

class XPortal {
  relayUrl = 'wss://relay.walletconnect.com';

  constructor() {}

  async initialize({
    chain,
    projectId,
    metadata,
    callbacks,
  }: InitializeParams): Promise<boolean> {
    console.log(chain, projectId, ' e?');
    await reduxStore.dispatch(setConnectionConfig({chain, projectId}));

    const options = metadata ? {metadata} : {};
    const connectionProvider = new WalletConnectProvider(
      callbacks,
      chain,
      this.relayUrl,
      projectId,
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

    if (walletConnectProvider.wasConnected) {
      await walletConnectProvider.reinitialize();
    }

    const {uri: connectorUri, approval} = await walletConnectProvider.connect();

    console.log(`[connectorUri]=${connectorUri}`);

    openXPortalForLogin(connectorUri);

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

  async signTransaction(tx: any) {
    // const tx
    openXPortal();
  }
}

// see about expiry in session

export const xPortalSingleton = new XPortal();
