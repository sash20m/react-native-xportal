import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { xPortalSingleton as XPortal } from '../core/XPortal';
import withReduxProvider from '../hocs/withReduxProvider';
import { useSelector } from 'react-redux';
const XPortalLogout = _ref => {
  let {
    content,
    style
  } = _ref;
  const isConnected = useSelector(state => state.connectionConfigSlice.connected);
  const [isLoading, setIsLoading] = useState(false);
  const xPortalLogout = async () => {
    try {
      setIsLoading(true);
      await XPortal.logout();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }
  };
  return /*#__PURE__*/React.createElement(TouchableOpacity, {
    style: [buttonStyle.container, style],
    onPress: xPortalLogout
  }, content ? content : /*#__PURE__*/React.createElement(View, null, isLoading ? /*#__PURE__*/React.createElement(ActivityIndicator, null) : /*#__PURE__*/React.createElement(Text, {
    style: buttonStyle.text
  }, isConnected ? 'Disconnect' : 'Disconnected')));
};
export default withReduxProvider(XPortalLogout);
const buttonStyle = StyleSheet.create({
  container: {
    width: 160,
    height: 50,
    backgroundColor: '#23f7dd',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 15,
    fontWeight: '600'
  }
});
//# sourceMappingURL=XPortalLogout.js.map