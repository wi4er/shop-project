import { NgModule } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { ElementListComponent } from './element-list/element-list.component';
import { ElementFormComponent } from './element-form/element-form.component';
import { SectionListComponent } from './section-list/section-list.component';
import { SectionFormComponent } from './section-form/section-form.component';
import { BlockListComponent } from './block-list/block-list.component';
import { BlockFormComponent } from './block-form/block-form.component';
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
import { PersonalModule } from '../personal/personal.module';

@NgModule({
  declarations: [
    ElementListComponent,
    ElementFormComponent,
    SectionListComponent,
    SectionFormComponent,
    BlockListComponent,
    BlockFormComponent,
  ],
  exports: [
    ElementListComponent,
    SectionListComponent,
  ],
  imports: [
    CommonModule,
    SettingsModule,
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
    PersonalModule,
  ],
})
export class ContentModule { }
