import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlagEditComponent } from './flag-edit/flag-edit.component';
import { PropertyEditComponent } from './property-edit/property-edit.component';
import { AddButtonComponent } from './add-button/add-button.component';
import { ItemMenuComponent } from './item-menu/item-menu.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { GroupPermissionComponent } from './group-permission/group-permission.component';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [
    AddButtonComponent,
    FlagEditComponent,
    PropertyEditComponent,
    ItemMenuComponent,
    GroupPermissionComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatMenuModule,
    MatTableModule,
  ],
  exports: [
    AddButtonComponent,
    FlagEditComponent,
    PropertyEditComponent,
    ItemMenuComponent,
    GroupPermissionComponent,
  ],
})
export class EditModule {
}
