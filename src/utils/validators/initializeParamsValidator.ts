import { InitializeParams } from '../../types/xPortal.types';

const acceptedChainIDs = ['1', 'd', 't'];

export const validateInitParams = (params: InitializeParams) => {
  let valid = true;
  if (!acceptedChainIDs.some((id) => id === `${params.chainId}`.toLowerCase())) {
    valid = false;
  }
  if (typeof params.projectId !== 'string') {
    valid = false;
  }
  if (
    !(
      params?.metadata?.description &&
      params?.metadata?.icons &&
      params?.metadata?.name &&
      params?.metadata?.url
    )
  ) {
    valid = false;
  }
  return valid;
};
