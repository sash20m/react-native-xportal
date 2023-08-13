import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { xPortalSingleton as XPortal } from '../core/XPortal';
const XPortalSignTx = _ref => {
  let {
    transactions,
    minGasLimit,
    style,
    content,
    callback
  } = _ref;
  const [isLoading, setIsLoading] = useState(false);
  const xPortalSignTx = async () => {
    try {
      setIsLoading(true);
      const response = await XPortal.signTransactions({
        transactions,
        minGasLimit
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
    onPress: xPortalSignTx
  }, content ? content : /*#__PURE__*/React.createElement(View, null, isLoading ? /*#__PURE__*/React.createElement(ActivityIndicator, null) : /*#__PURE__*/React.createElement(Text, {
    style: buttonStyle.text
  }, "Sign Transaction")));
};
export default XPortalSignTx;
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
//# sourceMappingURL=XPortalSignTx.js.map