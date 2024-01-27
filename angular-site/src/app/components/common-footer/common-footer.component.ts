import { Component } from '@angular/core';

@Component({
  selector: 'app-common-footer',
  templateUrl: './common-footer.component.html',
  styleUrls: ['./common-footer.component.css'],
})
export class CommonFooterComponent {

  menu = [{
    title: 'Discovery',
    items: [{
      name: 'New season',
      link: '/',
    }, {
      name: 'Most searched',
      link: '/',
    }, {
      name: 'Most selled',
      link: '/',
    }],
  }, {
    title: 'Info',
    items: [{
      name: 'Contact us',
      link: '/contact',
    }, {
      name: 'Privacy Policies',
      link: '/privacy',
    }, {
      name: 'Terms & Conditions',
      link: '/terms-conditions',
    }]
  }, {
    title: 'About',
    items: [{
      name: 'Help',
      link: '/',
    }, {
      name: 'Shipping',
      link: '/',
    }, {
      name: 'Affiliate',
      link: '/',
    }]
  }];

}
