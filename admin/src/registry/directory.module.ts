import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectoryListComponent } from './directory-list/directory-list.component';
import { DirectoryFormComponent } from './directory-form/directory-form.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { SettingsModule } from '../settings/settings.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { EditModule } from '../edit/edit.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DirectorySettingsComponent } from './directory-settings/directory-settings.component';
import { PointListComponent } from './point-list/point-list.component';
import { PointFormComponent } from './point-form/point-form.component';
import { PointSettingsComponent } from './point-settings/point-settings.component';
import { DirectoryHistoryComponent } from './directory-history/directory-history.component';
import { PointHistoryComponent } from './point-history/point-history.component';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    DirectoryListComponent,
    DirectoryFormComponent,
    DirectorySettingsComponent,
    PointListComponent,
    PointFormComponent,
    PointSettingsComponent,
    DirectoryHistoryComponent,
    PointHistoryComponent
  ],
  imports: [
    EditModule,
    CommonModule,
    SettingsModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTableModule,
    MatCheckboxModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatListModule,
  ],
  exports: [
    DirectoryListComponent,
    PointListComponent,
  ],
})
export class DirectoryModule { }
