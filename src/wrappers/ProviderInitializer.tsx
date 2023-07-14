import {useEffect} from 'react';
import {ProviderProps} from './xPortalProvider';
import {useDispatch, useSelector} from 'react-redux';
import {setConnectionConfig} from '../redux/slices/connectionConfig.slice';
import {ReduxStateSlices} from '../redux/index.reducer';
import {WalletSlice} from '../redux/slices/wallet.slice';
import {resetOnLogout} from '../redux/commonActions';

const ProviderInitializer = ({
  children,
  onLogin,
  onLogout,
  chain,
  projectId,
}: ProviderProps) => {
  const dispatch = useDispatch();
  const {connectionConfigSlice} = useSelector(
    (state: ReduxStateSlices) => state,
  );

  useEffect(() => {
    if (connectionConfigSlice.connected) {
      dispatch(resetOnLogout());
      dispatch(setConnectionConfig({chain, projectId}));
    }
  }, [chain, projectId, dispatch, connectionConfigSlice.connected]);

  return children;
};

export default ProviderInitializer;
