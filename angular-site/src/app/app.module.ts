import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SectionPageComponent } from './pages/section-page/section-page.component';
import { CatalogPageComponent } from './pages/catalog-page/catalog-page.component';
import { BasketPageComponent } from './pages/basket-page/basket-page.component';
import { AboutPageComponent } from './pages/about-page/about-page.component';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { MainFeaturesComponent } from './components/main-features/main-features.component';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    SectionPageComponent,
    CatalogPageComponent,
    BasketPageComponent,
    AboutPageComponent,
    TopNavComponent,
    FooterComponent,
    MainFeaturesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgOptimizedImage,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
