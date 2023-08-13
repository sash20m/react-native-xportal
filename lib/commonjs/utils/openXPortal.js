"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openXPortalForLogin = exports.openXPortal = void 0;
var _reactNative = require("react-native");
var _xportalDeeplink = require("../services/wallet/xportalDeeplink");
var _errorMessages = require("../constants/errorMessages");
var _errorComposer = require("./errorComposer");
/**
 * Opens XPortal with the intent to show the approve/cancel connection
 * screen with the DAPP.
 */
const openXPortalForLogin = connectorUri => {
  try {
    const encodedSchemaUrl = (0, _xportalDeeplink.getEncodedXPortalLoginSchemaUrl)(connectorUri);
    _reactNative.Linking.canOpenURL(encodedSchemaUrl).then(supported => {
      if (supported || _reactNative.Platform.OS === 'android') {
        return _reactNative.Linking.openURL(encodedSchemaUrl);
      }
    }).catch(err => console.log(err));
  } catch (error) {
    throw new Error((0, _errorComposer.errorComposer)({
      message: _errorMessages.ERROR_MESSAGES.XPORTAL_OPEN_FAIL,
      data: error
    }));
  }
};

/**
 * Simply redirects the user to XPortal by opening it or switching to it
 * on the phone screen.
 */
exports.openXPortalForLogin = openXPortalForLogin;
const openXPortal = () => {
  try {
    const encodedSchemaUrl = (0, _xportalDeeplink.getXPortalSchemaUrl)();
    _reactNative.Linking.canOpenURL(encodedSchemaUrl).then(supported => {
      if (supported || _reactNative.Platform.OS === 'android') {
        return _reactNative.Linking.openURL(encodedSchemaUrl);
      }
    }).catch(err => console.log(err));
  } catch (error) {
    throw new Error((0, _errorComposer.errorComposer)({
      message: _errorMessages.ERROR_MESSAGES.XPORTAL_OPEN_FAIL,
      data: error
    }));
  }
};
exports.openXPortal = openXPortal;
//# sourceMappingURL=openXPortal.js.map