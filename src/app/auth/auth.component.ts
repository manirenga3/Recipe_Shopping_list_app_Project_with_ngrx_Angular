import {
  Component,
  ComponentFactoryResolver,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceholderDirective } from '../shared/placeholder.directive';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit, OnDestroy {
  isLoginMode: boolean = true;
  pwdInputType = 'password';
  cnfPwdInputType = 'password';
  error: string = null;
  signupAuth = {
    password: '',
    confirmPassword: '',
  };
  @ViewChild('authForm') form: NgForm;
  @ViewChild(PlaceholderDirective, { static: false })
  alertHost: PlaceholderDirective;
  private storeSub: Subscription;
  private alertSub: Subscription;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit(): void {
    this.storeSub = this.store.select('auth').subscribe((authData) => {
      if (authData.user) {
        this.form.reset();
      }
      this.error = authData.authError;
      if (this.error) {
        this.showErrorAlert(this.error);
      }
    });
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onShowPassword(event: any) {
    this.pwdInputType = event.target.checked ? 'text' : 'password';
  }
  onShowConfirmPassword(event: any) {
    this.cnfPwdInputType = event.target.checked ? 'text' : 'password';
  }

  onSubmit() {
    if (!this.form.valid) return;

    const { email, password } = this.form.value;

    if (this.isLoginMode) {
      this.store.dispatch(
        new AuthActions.LoginStart({ email: email, password: password })
      );
    } else {
      this.store.dispatch(
        new AuthActions.SignupStart({ email: email, password: password })
      );
    }
  }

  onHandleError() {
    // This function is for only if we use ngIf to display alert component but we are displaying using component factory
    this.store.dispatch(new AuthActions.ClearError());
  }

  private showErrorAlert(message: string) {
    const alertCmpFactory =
      this.componentFactoryResolver.resolveComponentFactory(AlertComponent);

    const hostViewcontainerRef = this.alertHost.viewContainerRef;

    hostViewcontainerRef.clear();

    const componentRef = hostViewcontainerRef.createComponent(alertCmpFactory);
    componentRef.instance.message = message;
    this.alertSub = componentRef.instance.close.subscribe(() => {
      this.alertSub.unsubscribe;
      hostViewcontainerRef.clear();
    });
  }

  ngOnDestroy(): void {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
    if (this.alertSub) {
      this.alertSub.unsubscribe();
    }
  }
}
