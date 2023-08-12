import React, {useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {xPortalSingleton as XPortal} from '../core/XPortal';
import {XPortalSignTxProps} from '../types/xportalUi.types';

const XPortalSignTx = ({
  transactions,
  minGasLimit,
  style,
  content,
  callback,
}: XPortalSignTxProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const xPortalSignTx = async () => {
    try {
      setIsLoading(true);

      const response = await XPortal.signTransactions({
        transactions,
        minGasLimit,
      });
      callback(response);

      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message);
    }
  };

  return (
    <TouchableOpacity
      style={[buttonStyle.container, style]}
      onPress={xPortalSignTx}>
      {content ? (
        content
      ) : (
        <View>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={buttonStyle.text}>Sign Transaction</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default XPortalSignTx;

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
