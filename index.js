import '@walletconnect/react-native-compat';

global.TextEncoder = require('text-encoding').TextEncoder;
if (typeof BigInt === 'undefined') {
  global.BigInt = require('big-integer');
}

export {xPortalSingleton as XPortal} from './src/core/api/XPortal';
