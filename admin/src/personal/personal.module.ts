import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthDialogComponent } from './auth-dialog/auth-dialog.component';
import { AuthFormComponent } from './auth-form/auth-form.component';
import { GroupFormComponent } from './group-form/group-form.component';
import { GroupListComponent } from './group-list/group-list.component';
import { PermissionListComponent } from './permission-list/permission-list.component';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { ContactListComponent } from './contact-list/contact-list.component';
import { UserFormComponent } from './user-form/user-form.component';
import { UserListComponent } from './user-list/user-list.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { SettingsModule } from '../settings/settings.module';
import { MatButtonModule } from '@angular/material/button';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { ContactEditComponent } from './contact-edit/contact-edit.component';
import { ContactSettingsComponent } from './contact-settings/contact-settings.component';
import { GroupSettingsComponent } from './group-settings/group-settings.component';
import { MatSelectModule } from '@angular/material/select';
import { EditModule } from '../edit/edit.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    AuthDialogComponent,
    AuthFormComponent,
    GroupFormComponent,
    GroupListComponent,
    PermissionListComponent,
    ContactFormComponent,
    ContactListComponent,
    UserFormComponent,
    UserListComponent,
    UserSettingsComponent,
    ContactEditComponent,
    ContactSettingsComponent,
    GroupSettingsComponent,
  ],
  exports: [
    AuthDialogComponent,
    GroupListComponent,
    UserListComponent,
    ContactListComponent,
  ],
  imports: [
    CommonModule,
    EditModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatTabsModule,
    SettingsModule,
    MatButtonModule,
    MatTreeModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatToolbarModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
})
export class PersonalModule { }
