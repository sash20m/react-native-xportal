import React, {ReactElement} from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import StorePersist, {Store} from '../redux/store';
import ProviderInitializer from './ProviderInitializer';
import {ChainEnum} from '../types';

export interface ProviderProps {
  onLogin?: () => any;
  onLogout?: () => any;
  chain: 'mainnet' | 'testnet' | 'devnet' | ChainEnum;
  projectId: string;
  children?: React.ReactNode | ReactElement;
}

const XPortalProvider = ({
  onLogin,
  onLogout,
  chain,
  projectId,
  children,
}: ProviderProps) => {
  return (
    <Provider store={Store}>
      <PersistGate loading={null} persistor={StorePersist}>
        <ProviderInitializer
          onLogin={onLogin}
          onLogout={onLogout}
          chain={chain}
          projectId={projectId}>
          {children}
        </ProviderInitializer>
      </PersistGate>
    </Provider>
  );
};

export {XPortalProvider};
