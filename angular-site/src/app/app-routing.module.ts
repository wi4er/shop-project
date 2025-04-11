import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { AboutPageComponent } from './pages/about-page/about-page.component';
import { BlogPageComponent } from './pages/blog-page/blog-page.component';
import { TermsPageComponent } from './pages/terms-page/terms-page.component';
import { PrivacyPageComponent } from './pages/privacy-page/privacy-page.component';

const routes: Routes = [{
  path: '',
  component: MainPageComponent,
}, {
  path: 'about',
  component: AboutPageComponent,
}, {
  path: 'blog',
  component: BlogPageComponent,
}, {
  path: 'terms-and-conditions',
  component: TermsPageComponent,
}, {
  path: 'privacy-policy',
  component: PrivacyPageComponent,
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
