import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemMenuComponent } from './item-menu/item-menu.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AddButtonComponent } from './add-button/add-button.component';
import { FlagEditComponent } from './flag-edit/flag-edit.component';
import { FlagFormComponent } from './flag-form/flag-form.component';
import { FlagListComponent } from './flag-list/flag-list.component';
import { LangFormComponent } from './lang-form/lang-form.component';
import { LangListComponent } from './lang-list/lang-list.component';
import { PropertyEditComponent } from './property-edit/property-edit.component';
import { PropertyFormComponent } from './property-form/property-form.component';
import { PropertyListComponent } from './property-list/property-list.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    AddButtonComponent,
    FlagEditComponent,
    FlagFormComponent,
    FlagListComponent,
    ItemMenuComponent,
    LangFormComponent,
    LangListComponent,
    PropertyEditComponent,
    PropertyFormComponent,
    PropertyListComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatTabsModule,
    MatButtonModule,
  ],
  exports: [
    ItemMenuComponent,
    PropertyEditComponent,
    FlagEditComponent,
    AddButtonComponent,
  ],
})
export class SettingsModule { }
