import React from 'react';
import { Provider } from 'react-redux';
import { store, StorePersist } from '../redux/store';
import { PersistGate } from 'redux-persist/integration/react';

export default function withReduxProvider<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  return (props: T) => {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={StorePersist}>
          <WrappedComponent {...props} />
        </PersistGate>
      </Provider>
    );
  };
}
