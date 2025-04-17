import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DirectoryListComponent } from '../directory/directory-list/directory-list.component';
import { FlagListComponent } from '../settings/flag-list/flag-list.component';
import { LangListComponent } from '../settings/lang-list/lang-list.component';
import { PropertyListComponent } from '../settings/property-list/property-list.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ContentPageComponent } from './content-page/content-page.component';
import { FormListComponent } from '../form/form-list/form-list.component';
import { ResultListComponent } from '../form/result-list/result-list.component';
import { PermissionListComponent } from '../personal/permission-list/permission-list.component';
import { UserPageComponent } from './user-page/user-page.component';
import { DocumentListComponent } from '../document/document-list/document-list.component';
import { DocumentPageComponent } from './document-page/document-page.component';
import { BlockListComponent } from '../content/block-list/block-list.component';
import { StoragePageComponent } from './storage-page/storage-page.component';
import { CollectionPageComponent } from './collection-page/collection-page.component';
import { DashboardTileComponent } from '../dashboard/dashboard-tile/dashboard-tile.component';

const routes: Routes = [{
  path: '',
  component: DashboardTileComponent,
}, {
  path: 'user',
  component: UserPageComponent,
}, {
  path: 'permission',
  component: PermissionListComponent,
}, {
  path: 'content/:id',
  component: ContentPageComponent,
}, {
  path: 'content',
  component: BlockListComponent,
}, {
  path: 'directory',
  component: DirectoryListComponent,
}, {
  path: 'flag',
  component: FlagListComponent,
}, {
  path: 'lang',
  component: LangListComponent,
}, {
  path: 'property',
  component: PropertyListComponent,
}, {
  path: 'form',
  component: FormListComponent,
}, {
  path: 'form/:id',
  component: ResultListComponent,
}, {
  path: 'document',
  component: DocumentListComponent,
}, {
  path: 'document/:id',
  component: DocumentPageComponent,
}, {
  path: 'storage',
  component: StoragePageComponent,
}, {
  path: 'collection/:id',
  component: CollectionPageComponent,
}, {
  path: '**',
  component: NotFoundComponent,
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
