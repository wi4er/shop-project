import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { ProductPageComponent } from './pages/product-page/product-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegistrationPageComponent } from './pages/registation-page/registration-page.component';
import { OrderPageComponent } from './pages/order-page/order-page.component';
import { ContactPageComponent } from './pages/contact-page/contact-page.component';

const routes: Routes = [{
  path: '',
  component: MainPageComponent,
}, {
  path: 'product/:id',
  component: ProductPageComponent,
}, {
  path: 'personal',
  redirectTo: 'personal/login'
}, {
  path: 'personal/login',
  component: LoginPageComponent,
}, {
  path: 'personal/registration',
  component: RegistrationPageComponent,
}, {
  path: 'order',
  component: OrderPageComponent,
}, {
  path: 'contact',
  component: ContactPageComponent,
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
