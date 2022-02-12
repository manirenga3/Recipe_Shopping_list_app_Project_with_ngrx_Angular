import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { AuthComponent } from './auth.component';
import { AuthPageGuardService } from './authPage-guard.service';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    canActivate: [AuthPageGuardService],
  },
];

@NgModule({
  declarations: [AuthComponent],
  imports: [FormsModule, RouterModule.forChild(routes), SharedModule],
})
export class AuthModule {}
