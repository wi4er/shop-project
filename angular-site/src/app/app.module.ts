import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonLayoutComponent } from './components/common-layout/common-layout.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { ProductPageComponent } from './pages/product-page/product-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegistrationPageComponent } from './pages/registation-page/registration-page.component';
import { OrderPageComponent } from './pages/order-page/order-page.component';
import { ButtonComponent } from './view/button/button.component';
import { InputComponent } from './view/input/input.component';

@NgModule({
  declarations: [
    AppComponent,
    CommonLayoutComponent,
    MainPageComponent,
    ProductPageComponent,
    LoginPageComponent,
    RegistrationPageComponent,
    OrderPageComponent,
    ButtonComponent,
    InputComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
