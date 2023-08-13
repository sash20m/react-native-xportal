"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _enums = require("./enums.types");
Object.keys(_enums).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _enums[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _enums[key];
    }
  });
});
var _multiversx = require("./multiversx.types");
Object.keys(_multiversx).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _multiversx[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _multiversx[key];
    }
  });
});
//# sourceMappingURL=index.js.map