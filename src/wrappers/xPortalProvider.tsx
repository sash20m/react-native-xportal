import React, {ReactElement} from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import StorePersist, {Store} from '../redux/store';
import ProviderInitializer from './ProviderInitializer';
import {ChainEnum} from '../types';

export interface ProviderProps {
  onLogin?: () => any;
  onLogout?: () => any;
  chain: ChainEnum;
  projectId: string;
  children?: React.ReactNode | ReactElement;
}

const xPortalProvider = ({children, ...props}: ProviderProps) => {
  return (
    <Provider store={Store}>
      <PersistGate loading={null} persistor={StorePersist}>
        <ProviderInitializer {...props}>{children}</ProviderInitializer>
      </PersistGate>
    </Provider>
  );
};

export default xPortalProvider;
