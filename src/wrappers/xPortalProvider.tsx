import React from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import StorePersist, {Store} from '../redux/store';

const xPortalProvider = ({children}: any) => {
  return (
    <Provider store={Store}>
      <PersistGate loading={null} persistor={StorePersist}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default xPortalProvider;
