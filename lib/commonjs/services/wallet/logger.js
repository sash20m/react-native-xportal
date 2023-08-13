"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Logger = void 0;
class Logger {
  static error(message) {
    console.error('XPortal Background Activity - Error: ', message);
  }
  static trace(message) {
    console.trace(message);
  }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map