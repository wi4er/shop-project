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
