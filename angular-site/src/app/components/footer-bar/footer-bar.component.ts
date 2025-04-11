import { Component } from '@angular/core';

interface FooterItem {

  text: string;
  link?: string;

}

interface FooterList {

  title: string;
  list: Array<FooterItem>;

}

@Component({
  selector: 'app-footer-bar',
  templateUrl: './footer-bar.component.html',
  styleUrls: ['./footer-bar.component.css'],
})
export class FooterBarComponent {


  socialList = [{
    name: 'facebook',
    link: 'https://www.facebook.com/',
  }, {
    name: 'x',
    link: 'https://www.x.com',
  }, {
    name: 'instagram',
    link: 'https://www.instagram.com/',
  }, {
    name: 'linkedin',
    link: 'https://www.linkedin.com/in/',
  }, {
    name: 'youtube',
    link: 'https://www.outube.com/',
  }];

  constructor() {
    console.log(this.socialList);
  }

  copyrightList: Array<FooterItem> = [{
    text: 'Copyright © 2024 TackMe',
  }, {
    text: 'All Rights Reserved',
  }, {
    text: 'Terms and Conditions',
    link: '/terms-and-conditions',
  }, {
    text: 'Privacy Policy',
    link: '/privacy-policy',
  }];

  contentList: Array<FooterList> = [{
    title: 'Product',
    list: [{
      text: 'Features',
      link: '/',
    }, {
      text: 'Pricing',
      link: '/',
    }, {
      text: 'Case studies',
      link: '/',
    }, {
      text: 'Reviews',
      link: '/',
    }, {
      text: 'Updates',
      link: '/',
    }],
  }, {
    title: 'Company',
    list: [{
      text: 'About',
      link: '/about',
    }, {
      text: 'Contact us',
      link: '/',
    }, {
      text: 'Careerss',
      link: '/',
    }, {
      text: 'Culture',
      link: '/',
    }, {
      text: 'Blog',
      link: '/blog',
    }],
  }, {
    title: 'Support',
    list: [{
      text: 'Getting started',
      link: '/',
    }, {
      text: 'Help center',
      link: '/',
    }, {
      text: 'Server status',
      link: '/',
    }, {
      text: 'Report a bug',
      link: '/',
    }, {
      text: 'Chat support',
      link: '/',
    }],
  }, {
    title: 'Downloads',
    list: [{
      text: 'iOS',
      link: '/',
    }, {
      text: 'Android',
      link: '/',
    }, {
      text: 'Mac',
      link: '/',
    }, {
      text: 'Windows',
      link: '/',
    }, {
      text: 'Chrome',
      link: '/',
    }],
  }];

}
