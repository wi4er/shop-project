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
import { FormSettingsComponent } from './form-settings/form-settings.component';
import { FormHistoryComponent } from './form-history/form-history.component';
import { EditModule } from '../edit/edit.module';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    FormFormComponent,
    FormListComponent,
    ResultListComponent,
    FormSettingsComponent,
    FormHistoryComponent,
  ],
  imports: [
    CommonModule,
    EditModule,
    SettingsModule,
    FormsModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatButtonModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  exports: [
    FormListComponent,
  ]
})
export class FeedbackModule { }
