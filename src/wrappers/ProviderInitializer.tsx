import React from 'react';
import {useEffect} from 'react';
import {ProviderProps} from './xPortalProvider';
import {useDispatch, useSelector} from 'react-redux';
import {setConnectionConfig} from '../redux/slices/connectionConfig.slice';
import {ReduxStateSlices} from '../redux/index.reducer';
import {WalletSlice} from '../redux/slices/wallet.slice';
import {resetOnLogout} from '../redux/commonActions';
import {TouchableOpacity, View} from 'react-native';

const ProviderInitializer = ({
  children,
  onLogin,
  onLogout,
  chain,
  projectId,
}: ProviderProps) => {
  const dispatch = useDispatch();
  //   const {connectionConfigSlice} = useSelector(
  //     (state: ReduxStateSlices) => state,
  //   );

  //   useEffect(() => {
  //     // if (connectionConfigSlice.connected) {
  //     //   dispatch(resetOnLogout());
  //     // }
  //     dispatch(setConnectionConfig({chain, projectId}));
  //   }, [chain, projectId, dispatch]);

  //   useEffect(() => {
  //     console.log(connectionConfigSlice, ' effect ');
  //   }, [connectionConfigSlice]);

  //   const a = () => {
  //     console.log(connectionConfigSlice);
  //   };

  return (
    <View>
      <View>
        <TouchableOpacity onPress={() => a()}>fsdaf</TouchableOpacity>
      </View>
      {children}
    </View>
  );
};

export default ProviderInitializer;
