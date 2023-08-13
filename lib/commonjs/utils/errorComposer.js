"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.errorComposer = void 0;
const errorComposer = _ref => {
  let {
    message,
    data
  } = _ref;
  if (!data) {
    return message;
  }
  const dataFormatted = data !== null && data !== void 0 && data.message ? data.message : JSON.stringify(data);
  return `${message}. Error Info: ${dataFormatted}`;
};
exports.errorComposer = errorComposer;
//# sourceMappingURL=errorComposer.js.map