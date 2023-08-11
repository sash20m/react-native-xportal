import '@walletconnect/react-native-compat';

global.TextEncoder = require('text-encoding').TextEncoder;
if (typeof BigInt === 'undefined') {
  global.BigInt = require('big-integer');
}
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

export {xPortalSingleton as XPortal} from './src/core/XPortal';
export * from './src/ui';
