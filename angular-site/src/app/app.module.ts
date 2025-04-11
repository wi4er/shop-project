import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { TestimonialListComponent } from './components/testimonial-list/testimonial-list.component';
import { TestimonialItemComponent } from './components/testimonial-item/testimonial-item.component';
import { InsightListComponent } from './components/insight-list/insight-list.component';
import { InsightItemComponent } from './components/insight-item/insight-item.component';
import { BlogListComponent } from './components/blog-list/blog-list.component';
import { BlogItemComponent } from './components/blog-item/blog-item.component';
import { HeaderBarComponent } from './components/header-bar/header-bar.component';
import { FooterBarComponent } from './components/footer-bar/footer-bar.component';
import { ButtonComponent } from './widgets/button/button.component';
import { AboutPageComponent } from './pages/about-page/about-page.component';
import { BlogPageComponent } from './pages/blog-page/blog-page.component';
import { TermsPageComponent } from './pages/terms-page/terms-page.component';
import { PrivacyPageComponent } from './pages/privacy-page/privacy-page.component';
import { TeamListComponent } from './components/team-list/team-list.component';
import { TeamItemComponent } from './components/team-item/team-item.component';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    TestimonialListComponent,
    TestimonialItemComponent,
    InsightListComponent,
    InsightItemComponent,
    BlogListComponent,
    BlogItemComponent,
    HeaderBarComponent,
    FooterBarComponent,
    ButtonComponent,
    AboutPageComponent,
    BlogPageComponent,
    TermsPageComponent,
    PrivacyPageComponent,
    TeamListComponent,
    TeamItemComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgOptimizedImage,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
