import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AlertComponent } from './alert/alert.component';
import { DropdownDirective } from './dropdown.directive';
import { PlaceholderDirective } from './placeholder.directive';

@NgModule({
  declarations: [AlertComponent, PlaceholderDirective, DropdownDirective],
  imports: [CommonModule],
  exports: [
    AlertComponent,
    PlaceholderDirective,
    DropdownDirective,
    CommonModule,
  ],
})
export class SharedModule {}
