import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MainMenuComponent } from './main-menu/main-menu.component';
import { MatListModule } from "@angular/material/list";
import { MatDividerModule } from "@angular/material/divider";
import { NotFoundComponent } from './not-found/not-found.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { ContentPageComponent } from './content-page/content-page.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserPageComponent } from './user-page/user-page.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatRadioModule } from '@angular/material/radio';
import { ContentModule } from '../content/content.module';
import { PersonalModule } from '../personal/personal.module';
import { StorageModule } from '../storage/storage.module';
import { StoragePageComponent } from './storage-page/storage-page.component';
import { CollectionPageComponent } from './collection-page/collection-page.component';
import { PersonalPopupComponent } from './personal-popup/personal-popup.component';
import { DirectoryModule } from '../directory/directory.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@NgModule({
  declarations: [
    AppComponent,
    MainMenuComponent,
    NotFoundComponent,
    ContentPageComponent,
    UserPageComponent,
    StoragePageComponent,
    CollectionPageComponent,
    PersonalPopupComponent,
  ],
  imports: [
    BrowserModule,
    DashboardModule,
    FormsModule,
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
    MatFormFieldModule,
    MatInputModule,
    MatTreeModule,
    MatRadioModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    ContentModule,
    DirectoryModule,
    PersonalModule,
    StorageModule,
  ],
  providers: [],
  exports: [
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
