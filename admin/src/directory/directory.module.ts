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

@NgModule({
  declarations: [
    DirectoryListComponent,
    DirectoryFormComponent
  ],
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTableModule,
    MatCheckboxModule,
    MatMenuModule,
    MatToolbarModule,
    SettingsModule,
  ],
  exports: [
    DirectoryListComponent,
  ]
})
export class DirectoryModule { }
