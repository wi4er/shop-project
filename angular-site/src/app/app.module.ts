import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { ProductPageComponent } from './pages/product-page/product-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegistrationPageComponent } from './pages/registation-page/registration-page.component';
import { OrderPageComponent } from './pages/order-page/order-page.component';
import { ButtonComponent } from './view/button/button.component';
import { InputComponent } from './view/input/input.component';
import { NgOptimizedImage } from '@angular/common';
import { CommonFooterComponent } from './components/common-footer/common-footer.component';
import { ContactPageComponent } from './pages/contact-page/contact-page.component';
import { CommonHeaderComponent } from './components/common-header/common-header.component';
import { AuthFormComponent } from './components/auth-form/auth-form.component';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    ProductPageComponent,
    LoginPageComponent,
    RegistrationPageComponent,
    OrderPageComponent,
    ButtonComponent,
    InputComponent,
    CommonFooterComponent,
    ContactPageComponent,
    CommonHeaderComponent,
    AuthFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgOptimizedImage,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
