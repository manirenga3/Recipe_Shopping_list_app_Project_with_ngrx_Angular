import { User } from '../user.model';

import * as AuthActions from './auth.actions';

export interface State {
  user: User;
  authError: string;
}

const initialState: State = {
  user: null,
  authError: null,
};

export function authReducer(
  state: State = initialState,
  action: AuthActions.AuthActions
) {
  switch (action.type) {
    case AuthActions.LOGIN_START:
    case AuthActions.SIGNUP_START:
    case AuthActions.CLEAR_ERROR:
      return {
        ...state,
        authError: null,
      };

    case AuthActions.AUTHENTICATE_SUCCESS:
      const user = new User(
        action.payload.email,
        action.payload.id,
        action.payload.token,
        action.payload.expirationDate
      );
      return {
        ...state,
        user: user,
        authError: null,
      };

    case AuthActions.AUTHENTICATE_FAIL:
      return {
        ...state,
        user: null,
        authError: action.payload,
      };

    case AuthActions.LOGOUT:
      return {
        ...state,
        user: null,
        authError: null,
      };

    default:
      return state;
  }
}
