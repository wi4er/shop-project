import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionListComponent } from './collection-list/collection-list.component';
import { CollectionFormComponent } from './collection-form/collection-form.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SettingsModule } from '../settings/settings.module';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { FileListComponent } from './file-list/file-list.component';
import { FileFormComponent } from './file-form/file-form.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ArchiveListComponent } from './archive-list/archive-list.component';
import { EditModule } from '../edit/edit.module';
import { CollectionSettingsComponent } from './collection-settings/collection-settings.component';
import { FileSettingsComponent } from './file-settings/file-settings.component';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    CollectionListComponent,
    CollectionFormComponent,
    FileListComponent,
    FileFormComponent,
    ArchiveListComponent,
    CollectionSettingsComponent,
    FileSettingsComponent,
  ],
  exports: [
    CollectionListComponent,
    FileListComponent,
    ArchiveListComponent,
  ],
  imports: [
    CommonModule,
    EditModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatToolbarModule,
    SettingsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
  ],
})
export class StorageModule { }
