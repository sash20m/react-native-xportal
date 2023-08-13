import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { xPortalSingleton as XPortal } from '../core/XPortal';
const XPortalSignMessage = _ref => {
  let {
    message,
    style,
    content,
    callback
  } = _ref;
  const [isLoading, setIsLoading] = useState(false);
  const xPortalLogout = async () => {
    try {
      setIsLoading(true);
      const response = await XPortal.signMessage({
        message
      });
      callback(response);
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
  }, "Sign Message")));
};
export default XPortalSignMessage;
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
//# sourceMappingURL=XPortalSignMessage.js.map