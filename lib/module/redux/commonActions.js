import { createAction } from '@reduxjs/toolkit';
import { LOGIN_ACTION, LOGOUT_ACTION } from '../types';
export const resetOnLogout = createAction(LOGOUT_ACTION);
export const setConnectionOnLogin = createAction(LOGIN_ACTION, payload => ({
  payload
}));
//# sourceMappingURL=commonActions.js.map