const walletConnectDeepLink =
  'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://maiar.com/';

export function getXPortalSchemaUrl(): string {
  return walletConnectDeepLink;
}

export function getEncodedXPortalLoginSchemaUrl(
  wcUri: string | undefined,
): string {
  if (!wcUri) {
    return '';
  }
  return `${walletConnectDeepLink}?wallet-connect=${encodeURIComponent(wcUri)}`;
}

export function getXPortalLoginSchemaUrl(wcUri: string | undefined): string {
  if (!wcUri) {
    return '';
  }
  return `${walletConnectDeepLink}?wallet-connect=${wcUri}`;
}

// cSpell:ignore xPortal
