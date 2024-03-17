import { Component } from '@angular/core';

interface MenuItem {
  id: number;
  title: string;
  link: string;
}

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent {

  menu: Array<MenuItem> = [{
    id: 1,
    title: 'Plant pots',
    link: '/catalog/1',
  }, {
    id: 2,
    title: 'Ceramics',
    link: '/catalog/2',
  }, {
    id: 3,
    title: 'Tables',
    link: '/catalog/3',
  }, {
    id: 5,
    title: 'Chairs',
    link: '/catalog/5',
  }, {
    id: 6,
    title: 'Crockery',
    link: '/catalog/6',
  }, {
    id: 7,
    title: 'Tableware',
    link: '/catalog/7',
  }, {
    id: 8,
    title: 'Cutlery',
    link: '/catalog/8',
  }];

}
