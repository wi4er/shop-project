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
import { ContentListComponent } from './components/content-list/content-list.component';
import { BlockListComponent } from './components/block-list/block-list.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { LangListComponent } from './components/lang-list/lang-list.component';
import { FlagListComponent } from './components/flag-list/flag-list.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    MainMenuComponent,
    DashboardTileComponent,
    DirectoryListComponent,
    PropertyListComponent,
    ContentListComponent,
    BlockListComponent,
    UserListComponent,
    LangListComponent,
    FlagListComponent,
    NotFoundComponent
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
