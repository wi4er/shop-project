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
import { CommonListComponent } from './components/common-list/common-list.component';
import { FormListComponent } from './components/form-list/form-list.component';
import { FormFormComponent } from './components/form-form/form-form.component';
import { ResultListComponent } from './components/result-list/result-list.component';
import { PropertyEditComponent } from './components/property-edit/property-edit.component';
import { FlagEditComponent } from './components/flag-edit/flag-edit.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { PermissionListComponent } from './components/permission-list/permission-list.component';
import { UserPageComponent } from './components/user-page/user-page.component';
import { UserContactListComponent } from './components/user-contact-list/user-contact-list.component';
import { GroupListComponent } from './components/group-list/group-list.component';
import { UserContactFormComponent } from './components/user-contact-form/user-contact-form.component';
import { GroupFormComponent } from './components/group-form/group-form.component';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { DocumentFormComponent } from './components/document-form/document-form.component';
import { DocumentPageComponent } from './components/document-page/document-page.component';
import { AuthDialogComponent } from './components/auth-dialog/auth-dialog.component';
import { AuthFormComponent } from './components/auth-form/auth-form.component';
import { GroupTreeComponent } from './components/group-tree/group-tree.component';
import { MatTreeModule } from '@angular/material/tree';

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
    CommonListComponent,
    FormListComponent,
    FormFormComponent,
    ResultListComponent,
    PropertyEditComponent,
    FlagEditComponent,
    PermissionListComponent,
    UserPageComponent,
    UserContactListComponent,
    GroupListComponent,
    UserContactFormComponent,
    GroupFormComponent,
    DocumentListComponent,
    DocumentFormComponent,
    DocumentPageComponent,
    AuthDialogComponent,
    AuthFormComponent,
    GroupTreeComponent,
  ],
  imports: [
    BrowserModule,
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
