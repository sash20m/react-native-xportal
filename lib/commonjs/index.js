"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  XPortal: true
};
Object.defineProperty(exports, "XPortal", {
  enumerable: true,
  get: function () {
    return _XPortal.xPortalSingleton;
  }
});
require("@walletconnect/react-native-compat");
var _XPortal = require("./core/XPortal");
var _ui = require("./ui");
Object.keys(_ui).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _ui[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ui[key];
    }
  });
});
global.TextEncoder = require('text-encoding').TextEncoder;
if (typeof BigInt === 'undefined') {
  global.BigInt = require('big-integer');
}
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}
//# sourceMappingURL=index.js.map