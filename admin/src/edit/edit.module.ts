import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlagEditComponent } from './flag-edit/flag-edit.component';
import { AttributeEditComponent } from './attribute-edit/attribute-edit.component';
import { AddButtonComponent } from './add-button/add-button.component';
import { ItemMenuComponent } from './item-menu/item-menu.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { GroupPermissionComponent } from './group-permission/group-permission.component';
import { MatTableModule } from '@angular/material/table';
import { ImageEditComponent } from './image-edit/image-edit.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AccessEditComponent } from './access-edit/access-edit.component';
import { MatListModule } from '@angular/material/list';
import { DirectoryEditComponent } from './directory-edit/directory-edit.component';
import { BlockEditComponent } from './block-edit/block-edit.component';
import { CollectionEditComponent } from './collection-edit/collection-edit.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PointEditComponent } from './point-edit/point-edit.component';
import { MatDialogModule } from '@angular/material/dialog';
import { StringEditComponent } from './string-edit/string-edit.component';
import { DescriptionEditComponent } from './description-edit/description-edit.component';
import { FieldEditComponent } from './field-edit/field-edit.component';

@NgModule({
  declarations: [
    AddButtonComponent,
    FlagEditComponent,
    AttributeEditComponent,
    ImageEditComponent,
    ItemMenuComponent,
    GroupPermissionComponent,
    AccessEditComponent,
    DirectoryEditComponent,
    BlockEditComponent,
    CollectionEditComponent,
    PointEditComponent,
    StringEditComponent,
    DescriptionEditComponent,
    FieldEditComponent,
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
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatListModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
  ],
  exports: [
    AddButtonComponent,
    FlagEditComponent,
    AttributeEditComponent,
    ImageEditComponent,
    ItemMenuComponent,
    GroupPermissionComponent,
    AccessEditComponent,
    BlockEditComponent,
    DirectoryEditComponent,
    CollectionEditComponent,
    FieldEditComponent,
  ],
})
export class EditModule {
}
