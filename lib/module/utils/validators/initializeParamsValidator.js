const acceptedChainIDs = ['1', 'd', 't'];
export const validateInitParams = params => {
  var _params$metadata, _params$metadata2, _params$metadata3, _params$metadata4;
  let valid = true;
  if (!acceptedChainIDs.some(id => id === `${params.chainId}`.toLowerCase())) {
    valid = false;
  }
  if (typeof params.projectId !== 'string') {
    valid = false;
  }
  if (!(params !== null && params !== void 0 && (_params$metadata = params.metadata) !== null && _params$metadata !== void 0 && _params$metadata.description && params !== null && params !== void 0 && (_params$metadata2 = params.metadata) !== null && _params$metadata2 !== void 0 && _params$metadata2.icons && params !== null && params !== void 0 && (_params$metadata3 = params.metadata) !== null && _params$metadata3 !== void 0 && _params$metadata3.name && params !== null && params !== void 0 && (_params$metadata4 = params.metadata) !== null && _params$metadata4 !== void 0 && _params$metadata4.url)) {
    valid = false;
  }
  return valid;
};
//# sourceMappingURL=initializeParamsValidator.js.map