import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FlagFormComponent } from './flag-form/flag-form.component';
import { FlagListComponent } from './flag-list/flag-list.component';
import { LangFormComponent } from './lang-form/lang-form.component';
import { LangListComponent } from './lang-list/lang-list.component';
import { PropertyFormComponent } from './property-form/property-form.component';
import { PropertyListComponent } from './property-list/property-list.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EditModule } from '../edit/edit.module';

@NgModule({
  declarations: [
    FlagFormComponent,
    FlagListComponent,
    LangFormComponent,
    LangListComponent,
    PropertyFormComponent,
    PropertyListComponent,
  ],
  imports: [
    CommonModule,
    EditModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatTabsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatTableModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
  ],
  exports: [
  ],
})
export class SettingsModule { }
