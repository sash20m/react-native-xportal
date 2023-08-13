import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { xPortalSingleton as XPortal } from '../core/XPortal';
import withReduxProvider from '../hocs/withReduxProvider';
import { XPortalLoginProps } from '../types/xportalUi.types';
import { useSelector } from 'react-redux';
import { ReduxStateSlices } from '../redux/index.reducer';

const XPortalLogin = ({ content, style }: XPortalLoginProps) => {
  const isConnected = useSelector(
    (state: ReduxStateSlices) => state.connectionConfigSlice.connected
  );
  const [isLoading, setIsLoading] = useState(false);

  const xPortalLogin = async () => {
    try {
      setIsLoading(true);
      await XPortal.login();
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message);
    }
  };

  return (
    <TouchableOpacity style={[buttonStyle.container, style]} onPress={xPortalLogin}>
      {content ? (
        content
      ) : (
        <View>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={buttonStyle.text}>
              {isConnected ? 'XPortal Connected' : 'Connect XPortal'}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default withReduxProvider<XPortalLoginProps>(XPortalLogin);

const buttonStyle = StyleSheet.create({
  container: {
    width: 160,
    height: 50,
    backgroundColor: '#23f7dd',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
});
