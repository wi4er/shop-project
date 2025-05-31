import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FlagFormComponent } from './flag-form/flag-form.component';
import { FlagListComponent } from './flag-list/flag-list.component';
import { LangFormComponent } from './lang-form/lang-form.component';
import { LangListComponent } from './lang-list/lang-list.component';
import { AttributeFormComponent } from './attribute-form/attribute-form.component';
import { AttributeListComponent } from './attribute-list/attribute-list.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EditModule } from '../edit/edit.module';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AttributeHistoryComponent } from './attribute-history/attribute-history.component';
import { FlagHistoryComponent } from './flag-history/flag-history.component';
import { LangHistoryComponent } from './lang-history/lang-history.component';
import { AttributeSettingsComponent } from './attribute-settings/attribute-settings.component';
import { FlagSettingsComponent } from './flag-settings/flag-settings.component';
import { LangSettingsComponent } from './lang-settings/lang-settings.component';

@NgModule({
  declarations: [
    FlagFormComponent,
    FlagListComponent,
    LangFormComponent,
    LangListComponent,
    AttributeFormComponent,
    AttributeListComponent,
    AttributeHistoryComponent,
    FlagHistoryComponent,
    LangHistoryComponent,
    AttributeSettingsComponent,
    FlagSettingsComponent,
    LangSettingsComponent,
  ],
  imports: [
    CommonModule,
    EditModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatTabsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatTableModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  exports: [
  ],
})
export class SettingsModule { }
