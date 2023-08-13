import React from 'react';
import { Provider } from 'react-redux';
import { store, StorePersist } from '../redux/store';
import { PersistGate } from 'redux-persist/integration/react';
export default function withReduxProvider(WrappedComponent) {
  return props => {
    return /*#__PURE__*/React.createElement(Provider, {
      store: store
    }, /*#__PURE__*/React.createElement(PersistGate, {
      loading: null,
      persistor: StorePersist
    }, /*#__PURE__*/React.createElement(WrappedComponent, props)));
  };
}
//# sourceMappingURL=withReduxProvider.js.map