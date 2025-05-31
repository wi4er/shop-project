import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { StorageModule } from '../storage/storage.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ElementSettingsComponent } from './element-settings/element-settings.component';
import { MatListModule } from '@angular/material/list';
import { BlockSettingsComponent } from './block-settings/block-settings.component';
import { SectionSettingsComponent } from './section-settings/section-settings.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EditModule } from '../edit/edit.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BlockHistoryComponent } from './block-history/block-history.component';
import { ElementHistoryComponent } from './element-history/element-history.component';
import { SectionHistoryComponent } from './section-history/section-history.component';
import { RouterLink } from '@angular/router';

@NgModule({
  declarations: [
    ElementListComponent,
    ElementFormComponent,
    SectionListComponent,
    SectionFormComponent,
    BlockListComponent,
    BlockFormComponent,
    ElementSettingsComponent,
    BlockSettingsComponent,
    SectionSettingsComponent,
    BlockHistoryComponent,
    ElementHistoryComponent,
    SectionHistoryComponent,
  ],
  exports: [
    ElementListComponent,
    SectionListComponent,
  ],
  imports: [
    EditModule,
    CommonModule,
    HttpClientModule,
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
    MatCardModule,
    MatSnackBarModule,
    MatListModule,
    MatProgressSpinnerModule,
    PersonalModule,
    StorageModule,
    MatTooltipModule,
    RouterLink,
  ],
})
export class ContentModule { }
