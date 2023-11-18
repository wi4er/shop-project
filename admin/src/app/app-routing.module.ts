import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardTileComponent } from './components/dashboard-tile/dashboard-tile.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { BlockListComponent } from './components/block-list/block-list.component';
import { DirectoryListComponent } from './components/directory-list/directory-list.component';
import { FlagListComponent } from './components/flag-list/flag-list.component';
import { LangListComponent } from './components/lang-list/lang-list.component';
import { PropertyListComponent } from './components/property-list/property-list.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ContentPageComponent } from './components/content-page/content-page.component';
import { FormListComponent } from './components/form-list/form-list.component';
import { ResultListComponent } from './components/result-list/result-list.component';

const routes: Routes = [{
  path: '',
  component: DashboardTileComponent,
}, {
  path: 'user',
  component: UserListComponent,
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
  path: '**',
  component: NotFoundComponent,
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
