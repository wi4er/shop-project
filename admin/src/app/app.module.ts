import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { MatListModule } from "@angular/material/list";
import { MatDivider, MatDividerModule } from "@angular/material/divider";
import { DashboardTileComponent } from './components/dashboard-tile/dashboard-tile.component';
import { DirectoryListComponent } from './components/directory-list/directory-list.component';
import { PropertyListComponent } from './components/property-list/property-list.component';
import { BlockListComponent } from './components/block-list/block-list.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { LangListComponent } from './components/lang-list/lang-list.component';
import { FlagListComponent } from './components/flag-list/flag-list.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { BlockFormComponent } from './components/block-form/block-form.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { AddButtonComponent } from './components/add-button/add-button.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { UserFormComponent } from './components/user-form/user-form.component';
import { DirectoryFormComponent } from './components/directory-form/directory-form.component';
import { PropertyFormComponent } from './components/property-form/property-form.component';
import { FlagFormComponent } from './components/flag-form/flag-form.component';
import { LangFormComponent } from './components/lang-form/lang-form.component';
import { ElementFormComponent } from './components/element-form/element-form.component';
import { SectionFormComponent } from './components/section-form/section-form.component';
import { ContentPageComponent } from './components/content-page/content-page.component';
import { MatTabsModule } from '@angular/material/tabs';
import { SectionListComponent } from './components/section-list/section-list.component';
import { ElementListComponent } from './components/element-list/element-list.component';
import { ItemMenuComponent } from './components/item-menu/item-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    AddButtonComponent,
    MainMenuComponent,
    DashboardTileComponent,
    DirectoryListComponent,
    PropertyListComponent,
    BlockListComponent,
    UserListComponent,
    LangListComponent,
    FlagListComponent,
    NotFoundComponent,
    BlockFormComponent,
    UserFormComponent,
    DirectoryFormComponent,
    PropertyFormComponent,
    FlagFormComponent,
    LangFormComponent,
    ElementFormComponent,
    SectionFormComponent,
    ContentPageComponent,
    SectionListComponent,
    ElementListComponent,
    ItemMenuComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    MatCheckboxModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatDialogModule,
    MatTabsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
