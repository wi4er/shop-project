import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormFormComponent } from './form-form/form-form.component';
import { FormListComponent } from './form-list/form-list.component';
import { ResultListComponent } from './result-list/result-list.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { SettingsModule } from '../settings/settings.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    FormFormComponent,
    FormListComponent,
    ResultListComponent,
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatTabsModule,
    SettingsModule,
    MatButtonModule,
  ],
  exports: [
    FormListComponent,
  ]
})
export class FormModule { }
