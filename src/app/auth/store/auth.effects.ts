import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HotToastService } from '@ngneat/hot-toast';

import * as AuthActions from './auth.actions';

import { environment } from '../../../environments/environment';
import { User } from '../user.model';
import { AuthService } from '../auth.service';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  kind?: string;
  registered?: boolean;
  displayName?: string;
}

const handleAuthentication = (
  email: string,
  id: string,
  token: string,
  expiresIn: number
) => {
  const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
  const user = new User(email, id, token, expirationDate);
  localStorage.setItem('userData', JSON.stringify(user));
  return new AuthActions.AuthenticateSuccess({
    email: email,
    id: id,
    token: token,
    expirationDate: expirationDate,
    redirect: true,
  });
};

const handleError = (errorRes: any) => {
  let errorMessage = 'An unknown error occured';
  if (!errorRes.error || !errorRes.error.error) {
    return of(new AuthActions.AuthenticateFail(errorMessage));
  }
  switch (errorRes.error.error.message) {
    case 'EMAIL_EXISTS':
      errorMessage = 'Email already exists';
      break;
    case 'OPERATION_NOT_ALLOWED':
      errorMessage = 'Password sign-in is disabled for this app';
      break;
    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
      errorMessage =
        'We have blocked all requests from this device due to unusual activity. Try again later';
      break;
    case 'EMAIL_NOT_FOUND':
      errorMessage = 'Email does not exists';
      break;
    case 'INVALID_PASSWORD':
      errorMessage = 'Password is not correct';
      break;
    case 'USER_DISABLED':
      errorMessage = 'User has been disabled';
      break;
  }
  return of(new AuthActions.AuthenticateFail(errorMessage));
};

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private toast: HotToastService,
    private router: Router,
    private authService: AuthService
  ) {}

  authLoginStart = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.LOGIN_START),
      switchMap((loginStart: AuthActions.LoginStart) => {
        return this.http
          .post<AuthResponseData>(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseApiKey}`,
            {
              email: loginStart.payload.email,
              password: loginStart.payload.password,
              returnSecureToken: true,
            }
          )
          .pipe(
            this.toast.observe({
              success: 'Logged in successfully',
              loading: 'Logging in...',
              error: 'There was an error',
            }),
            map((resData) => {
              this.authService.setLogoutTimer(+resData.expiresIn * 1000);
              return handleAuthentication(
                resData.email,
                resData.localId,
                resData.idToken,
                +resData.expiresIn
              );
            }),
            catchError((errorRes) => {
              return handleError(errorRes);
            })
          );
      })
    );
  });

  authAutoLogin = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.AUTO_LOGIN),
      map(() => {
        const userData: {
          email: string;
          id: string;
          _token: string;
          _tokenExpirationDate: string;
        } = JSON.parse(localStorage.getItem('userData'));

        if (!userData) {
          return { type: 'DUMMY' };
        }

        const loadedUser = new User(
          userData.email,
          userData.id,
          userData._token,
          new Date(userData._tokenExpirationDate)
        );
        if (loadedUser.token) {
          const expirationDuration =
            new Date(userData._tokenExpirationDate).getTime() -
            new Date().getTime();
          this.authService.setLogoutTimer(expirationDuration);
          return new AuthActions.AuthenticateSuccess({
            email: userData.email,
            id: userData.id,
            token: userData._token,
            expirationDate: new Date(userData._tokenExpirationDate),
            redirect: false,
          });
        } else {
          localStorage.removeItem('userData');
          return { type: 'DUMMY' };
        }
      })
    );
  });

  authSignupStart = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.SIGNUP_START),
      switchMap((signupAction: AuthActions.SignupStart) => {
        return this.http
          .post<AuthResponseData>(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseApiKey}`,
            {
              email: signupAction.payload.email,
              password: signupAction.payload.password,
              returnSecureToken: true,
            }
          )
          .pipe(
            this.toast.observe({
              success: 'Signed up successfully',
              loading: 'Signing up in...',
              error: 'There was an error',
            }),
            map((resData) => {
              this.authService.setLogoutTimer(+resData.expiresIn * 1000);
              return handleAuthentication(
                resData.email,
                resData.localId,
                resData.idToken,
                +resData.expiresIn
              );
            }),
            catchError((errorRes) => {
              return handleError(errorRes);
            })
          );
      })
    );
  });

  // @Effect({ dispatch: false })
  // authSuccess = this.actions$.pipe(
  //   ofType(AuthActions.LOGIN_SUCCESS),
  //   tap(() => {
  //     this.router.navigate(['/']);
  //   })
  // );
  authSuccess = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS),
        tap((action: AuthActions.AuthenticateSuccess) => {
          if (action.payload.redirect) {
            this.router.navigate(['/']);
          }
        })
      );
    },
    { dispatch: false }
  );

  authLogout = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.LOGOUT),
        tap(() => {
          this.authService.clearLogoutTimer();
          localStorage.removeItem('userData');
          this.router.navigate(['/auth']);
        })
      );
    },
    { dispatch: false }
  );
}
