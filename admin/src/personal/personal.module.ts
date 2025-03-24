import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthDialogComponent } from './auth-dialog/auth-dialog.component';
import { AuthFormComponent } from './auth-form/auth-form.component';
import { GroupFormComponent } from './group-form/group-form.component';
import { GroupListComponent } from './group-list/group-list.component';
import { GroupTreeComponent } from './group-tree/group-tree.component';
import { PermissionListComponent } from './permission-list/permission-list.component';
import { UserContactFormComponent } from './user-contact-form/user-contact-form.component';
import { UserContactListComponent } from './user-contact-list/user-contact-list.component';
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
import { UserContactSettingsComponent } from './user-contact-settings/user-contact-settings.component';



@NgModule({
  declarations: [
    AuthDialogComponent,
    AuthFormComponent,
    GroupFormComponent,
    GroupListComponent,
    GroupTreeComponent,
    PermissionListComponent,
    UserContactFormComponent,
    UserContactListComponent,
    UserFormComponent,
    UserListComponent,
    UserSettingsComponent,
    ContactEditComponent,
    UserContactSettingsComponent,
  ],
  exports: [
    AuthDialogComponent,
    GroupListComponent,
    UserListComponent,
    UserContactListComponent,
    GroupTreeComponent,
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
    MatTreeModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatToolbarModule,
  ],
})
export class PersonalModule { }
