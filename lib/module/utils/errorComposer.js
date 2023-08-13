export const errorComposer = _ref => {
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
//# sourceMappingURL=errorComposer.js.map