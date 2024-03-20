import { Component } from '@angular/core';


interface FeatureItem {

  id: number;
  ico: string;
  title: string;
  text: string;

}

@Component({
  selector: 'app-main-features',
  templateUrl: './main-features.component.html',
  styleUrls: ['./main-features.component.css']
})
export class MainFeaturesComponent {

  list: Array<FeatureItem> = [{
    id: 1,
    ico: 'assets/svg/Delivery.svg',
    title: 'Next day as standard',
    text: 'Order before 3pm and get your order the next day as standard',
  }, {
    id: 2,
    ico: 'assets/svg/Delivery.svg',
    title: 'Made by true artisans',
    text: 'Handmade crafted goods made with real passion and craftmanship',
  }, {
    id: 3,
    ico: 'assets/svg/Delivery.svg',
    title: 'Unbeatable prices',
    text: 'For our materials and quality you won’t find better prices anywhere',
  }, {
    id: 4,
    ico: 'assets/svg/Delivery.svg',
    title: 'Recycled packaging',
    text: 'We use 100% recycled to ensure our footprint is more manageable',
  }];

}
