import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { xPortalSingleton as XPortal } from '../core/XPortal';
import { XPortalSignMessageProps } from '../types/xportalUi.types';

const XPortalSignMessage = ({ message, style, content, callback }: XPortalSignMessageProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const xPortalLogout = async () => {
    try {
      setIsLoading(true);

      const response = await XPortal.signMessage({ message });
      callback(response);

      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message);
    }
  };

  return (
    <TouchableOpacity style={[buttonStyle.container, style]} onPress={xPortalLogout}>
      {content ? (
        content
      ) : (
        <View>
          {isLoading ? <ActivityIndicator /> : <Text style={buttonStyle.text}>Sign Message</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default XPortalSignMessage;

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
