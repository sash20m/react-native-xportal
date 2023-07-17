import {InitializeParams} from './types';

class XPortal {
  constructor() {}

  async initialize(config: InitializeParams): Promise<boolean> {
    console.log(config);
    // if (connectionConfigSlice.connected) {
    //     //   dispatch(resetOnLogout());
    //     // }
    //     dispatch(setConnectionConfig({chain, projectId}));
    return true;
  }
}

export const xPortalSingleton = new XPortal();
