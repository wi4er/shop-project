import { Component } from '@angular/core';


interface FooterMenuItem {

  id: number;
  title: string;
  link: string;

}

interface FooterMenu {

  id: number;
  title: string;
  link: string;
  list: Array<FooterMenuItem>;
  mobile: boolean;

}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {

  menu: Array<FooterMenu> = [{
    id: 1,
    title: 'Menu',
    link: '',
    mobile: true,
    list: [{
      id: 1,
      title: 'New arrivals',
      link: '',
    }, {
      id: 2,
      title: 'Best sellers',
      link: '',
    }, {
      id: 3,
      title: 'Recently viewed',
      link: '',
    }, {
      id: 4,
      title: 'Popular this week',
      link: '',
    }, {
      id: 5,
      title: 'All products',
      link: '',
    }],
  }, {
    id: 2,
    title: 'Categories',
    link: '',
    mobile: false,
    list: [{
      id: 1,
      title: 'Crockery',
      link: '',
    }, {
      id: 2,
      title: 'Furniture',
      link: '',
    }, {
      id: 3,
      title: 'Homeware',
      link: '',
    }, {
      id: 4,
      title: 'Plant pots',
      link: '',
    }, {
      id: 5,
      title: 'Chairs',
      link: '',
    }, {
      id: 6,
      title: 'Crockery',
      link: '',
    }],
  }, {
    id: 3,
    title: 'Our company',
    link: '',
    mobile: true,
    list: [{
      id: 1,
      title: 'About us',
      link: '',
    }, {
      id: 2,
      title: 'Vacancies',
      link: '',
    }, {
      id: 3,
      title: 'Contact us',
      link: '',
    }, {
      id: 4,
      title: 'Privacy',
      link: '',
    }, {
      id: 5,
      title: 'Returns policy',
      link: '',
    }],
  }];

}
