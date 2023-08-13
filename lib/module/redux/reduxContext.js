import { createContext } from 'react';
import { createDispatchHook, createSelectorHook, createStoreHook } from 'react-redux';
import { store, subscription } from './store';
const defaultContextValue = {
  store,
  subscription
};
export const DappCoreContext = /*#__PURE__*/createContext(defaultContextValue);
export const useStore = createStoreHook(DappCoreContext);
export const useDispatch = createDispatchHook(DappCoreContext);
export const useSelector = createSelectorHook(DappCoreContext);
//# sourceMappingURL=reduxContext.js.map