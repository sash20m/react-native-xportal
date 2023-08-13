"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEncodedXPortalLoginSchemaUrl = getEncodedXPortalLoginSchemaUrl;
exports.getXPortalSchemaUrl = getXPortalSchemaUrl;
const walletConnectDeepLink = 'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://maiar.com/';
function getXPortalSchemaUrl() {
  return walletConnectDeepLink;
}

/**
 * This function is used alongside the wallet connect uri
 * when the user wants to connect XPortal. With the returned url
 * the user can be redirected to XPortal to accept the incoming connection.
 */
function getEncodedXPortalLoginSchemaUrl(wcUri) {
  if (!wcUri) {
    return '';
  }
  return `${walletConnectDeepLink}?wallet-connect=${encodeURIComponent(wcUri)}`;
}

// cSpell:ignore xPortal
//# sourceMappingURL=xportalDeeplink.js.map