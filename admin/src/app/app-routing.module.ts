import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DirectoryListComponent } from '../registry/directory-list/directory-list.component';
import { FlagListComponent } from '../settings/flag-list/flag-list.component';
import { LangListComponent } from '../settings/lang-list/lang-list.component';
import { AttributeListComponent } from '../settings/attribute-list/attribute-list.component';
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
import { PointListComponent } from '../registry/point-list/point-list.component';
import { PointPageComponent } from './point-page/point-page.component';

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
  path: 'registry',
  component: DirectoryListComponent,
}, {
  path: 'directory/:id',
  component: PointPageComponent,
}, {
  path: 'flag',
  component: FlagListComponent,
}, {
  path: 'lang',
  component: LangListComponent,
}, {
  path: 'attribute',
  component: AttributeListComponent,
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
  path: 'bundle/:id',
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
