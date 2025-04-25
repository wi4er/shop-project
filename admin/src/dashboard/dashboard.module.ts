import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardTileComponent } from './dashboard-tile/dashboard-tile.component';
import { DashboardContentComponent } from './dashboard-content/dashboard-content.component';
import { DashboardCollectionComponent } from './dashboard-collection/dashboard-collection.component';
import { DashboardDirectoryComponent } from './dashboard-directory/dashboard-directory.component';
import { DashboardAttributeComponent } from './dashboard-attribute/dashboard-attribute.component';
import { DashboardFlagComponent } from './dashboard-flag/dashboard-flag.component';
import { DashboardLangComponent } from './dashboard-lang/dashboard-lang.component';
import { DashboardConfigComponent } from './dashboard-config/dashboard-config.component';
import { DashboardPersonalComponent } from './dashboard-personal/dashboard-personal.component';
import { DashboardArchiveComponent } from './dashboard-archive/dashboard-archive.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    DashboardTileComponent,
    DashboardContentComponent,
    DashboardCollectionComponent,
    DashboardDirectoryComponent,
    DashboardAttributeComponent,
    DashboardFlagComponent,
    DashboardLangComponent,
    DashboardConfigComponent,
    DashboardPersonalComponent,
    DashboardArchiveComponent,

  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatToolbarModule,
    MatGridListModule,
    MatListModule,
    MatButtonModule,

  ]
})
export class DashboardModule { }
