import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ProductPageComponent } from './pages/product-page/product-page.component';
import { SectionPageComponent } from './pages/section-page/section-page.component';
import { CatalogPageComponent } from './pages/catalog-page/catalog-page.component';
import { BasketPageComponent } from './pages/basket-page/basket-page.component';
import { AboutPageComponent } from './pages/about-page/about-page.component';

const routes: Routes = [{
  path: '',
  component: HomePageComponent,
}, {
  path: 'product/:id',
  component: ProductPageComponent,
}, {
  path: 'catalog',
  component: CatalogPageComponent,
}, {
  path: 'catalog/:id',
  component: SectionPageComponent,
}, {
  path: 'basket',
  component: BasketPageComponent,
}, {
  path: 'about',
  component: AboutPageComponent,
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
